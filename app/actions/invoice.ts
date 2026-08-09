"use server";

import { db } from "../../drizzle";
import {
  invoices,
  jobExpenses,
  simpleExpenses,
  subExpenses,
} from "@/drizzle/schema";
import { InvoiceData } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { User } from "@supabase/supabase-js";

const parseDate = (dateString?: string | null) => {
  if (!dateString || dateString.trim() === "") {
    return null;
  }
  return new Date(dateString);
};

export async function getInvoiceById(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }
  try {
    if (!invoiceId || invoiceId === "new") return null;

    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, invoiceId), eq(invoices.userId, user.id)),
      with: {
        jobExpenses: {
          with: { subExpenses: true },
        },
        simpleExpenses: true,
      },
    });

    if (!invoice) return null;

    const formattedJobExpenses = (invoice.jobExpenses || []).map((job) => ({
      ...job,
      type: "job",
    }));

    const formattedSimpleExpenses = (invoice.simpleExpenses || []).map(
      (simple) => ({
        ...simple,
        type: "simple",
        date: simple.date ? simple.date.toISOString() : "",
      }),
    );

    const formattedData = {
      ...invoice,
      date: invoice.date ? invoice.date.toISOString() : "",
      advanceDate: invoice.advanceDate ? invoice.advanceDate.toISOString() : "",
      prevBalanceDate: invoice.prevBalanceDate
        ? invoice.prevBalanceDate.toISOString()
        : "",

      expenses: [...formattedJobExpenses, ...formattedSimpleExpenses],
    };

    return formattedData as unknown as InvoiceData;
  } catch (error) {
    console.error("Real error inside getInvoiceById:", error);
    throw error;
  }
}

export async function getAllInvoice(): Promise<{
  invoices: InvoiceData[];
  user: User | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { invoices: [], user: null };
  }
  try {
    const invoiceData = await db.query.invoices.findMany({
      where: and(eq(invoices.userId, user.id)),
      with: {
        jobExpenses: {
          with: { subExpenses: true },
        },
        simpleExpenses: true,
      },
    });

    const formattedData = invoiceData.map((invoice) => ({
      ...invoice,
      date: invoice.date.toISOString(),
      expenses: [...invoice.jobExpenses, ...invoice.simpleExpenses],
    }));

    return { invoices: formattedData as unknown as InvoiceData[], user: user };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw new Error("Error occur");
  }
}

export async function saveInvoice(data: InvoiceData, isNew: boolean) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth Error:", authError);
      throw new Error("Unauthorized: account not logged in");
    }

    const invoiceId = data.id || crypto.randomUUID();

    await db.transaction(async (tx) => {
      const invoicePayload = {
        port: data.port,
        employeeName: data.employeeName,
        date: data.date ? new Date(data.date) : new Date(),
        advanceAmount: data.advanceAmount,
        advanceDate: parseDate(data.advanceDate),
        prevBalanceAmount: data.prevBalanceAmount,
        prevBalanceDate: parseDate(data.prevBalanceDate),
        totalAmount: data.totalAmount,
        remainingAmount: data.remainingAmount,
      };

      if (isNew) {
        await tx.insert(invoices).values({
          id: invoiceId,
          userId: user.id,
          ...invoicePayload,
        });
      } else {
        await tx
          .update(invoices)
          .set(invoicePayload)
          .where(eq(invoices.id, invoiceId));

        const existingJobExp = await tx.query.jobExpenses.findMany({
          where: eq(jobExpenses.invoiceId, invoiceId),
          columns: { id: true },
        });

        const jobExpIds = existingJobExp.map((e) => e.id);
        if (jobExpIds.length > 0) {
          await tx
            .delete(subExpenses)
            .where(inArray(subExpenses.jobExpenseId, jobExpIds));
        }

        await tx
          .delete(jobExpenses)
          .where(eq(jobExpenses.invoiceId, invoiceId));
        await tx
          .delete(simpleExpenses)
          .where(eq(simpleExpenses.invoiceId, invoiceId));
      }

      // Define explicit type for the accumulator to ensure full Type Safety
      type ExpenseAccumulator = {
        newJobExpenses: (typeof jobExpenses.$inferInsert)[];
        newSimpleExpenses: (typeof simpleExpenses.$inferInsert)[];
        newSubExpenses: (typeof subExpenses.$inferInsert)[];
      };

      const { newJobExpenses, newSimpleExpenses, newSubExpenses } =
        data.expenses.reduce<ExpenseAccumulator>(
          (acc, item) => {
            if (item.type === "job") {
              const jobExpenseId = crypto.randomUUID();

              acc.newJobExpenses.push({
                id: jobExpenseId,
                invoiceId,
                description: item.description,
                amount: item.amount,
              });

              if (item.subExpenses?.length) {
                item.subExpenses.forEach((sub) => {
                  acc.newSubExpenses.push({
                    id: crypto.randomUUID(),
                    jobExpenseId,
                    label: sub.label,
                    amount: sub.amount,
                  });
                });
              }
            } else {
              acc.newSimpleExpenses.push({
                id: crypto.randomUUID(),
                invoiceId,
                description: item.description,
                amount: item.amount,
                date: parseDate(item.date),
              });
            }

            return acc;
          },
          { newJobExpenses: [], newSimpleExpenses: [], newSubExpenses: [] },
        );

      // Insert into Database
      if (newJobExpenses.length > 0) {
        await tx.insert(jobExpenses).values(newJobExpenses);
      }
      if (newSimpleExpenses.length > 0) {
        await tx.insert(simpleExpenses).values(newSimpleExpenses);
      }
      if (newSubExpenses.length > 0) {
        await tx.insert(subExpenses).values(newSubExpenses);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save invoice:", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth Error:", authError);
      throw new Error("Unauthorized: account not logged in");
    }

    await db.transaction(async (tx) => {
      const existingJobExp = await tx.query.jobExpenses.findMany({
        where: eq(jobExpenses.invoiceId, invoiceId),
        columns: { id: true },
      });

      const jobExpIds = existingJobExp.map((e) => e.id);
      if (jobExpIds.length > 0) {
        await tx
          .delete(subExpenses)
          .where(inArray(subExpenses.jobExpenseId, jobExpIds));
      }

      await tx.delete(jobExpenses).where(eq(jobExpenses.invoiceId, invoiceId));
      await tx
        .delete(simpleExpenses)
        .where(eq(simpleExpenses.invoiceId, invoiceId));

      await tx.delete(invoices).where(eq(invoices.id, invoiceId));
    });
    return { success: true, message: "Invoice deleted successfully!" };
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, message: "Failed to delete invoice:" };
  } finally {
    revalidatePath("/dashboard");
  }
}

export async function getRemainingBalance() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { amount: 0, date: null };
  }

  const lastInvoice = await db.query.invoices.findFirst({
    where: eq(invoices.userId, user.id),
    orderBy: [desc(invoices.date), desc(invoices.createdAt)],
  });

  if (!lastInvoice || !lastInvoice.remainingAmount) {
    return { amount: 0, date: null };
  }

  return {
    amount:
      lastInvoice.remainingAmount > 0 ? Number(lastInvoice.remainingAmount) : 0,
    date: lastInvoice.remainingAmount > 0 ? lastInvoice.date : null,
  };
}
