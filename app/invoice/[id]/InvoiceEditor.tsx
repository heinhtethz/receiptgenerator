"use client";

import { getRemainingBalance, saveInvoice } from "@/app/actions/invoice";
import { AddJobButton } from "@/components/AddJobButton";
import JobExpenseCard from "@/components/JobExpenseCard";
import { PortSelector } from "@/components/PortSelector";
import { Preview } from "@/components/Preview";
import SimpleExpenseCard from "@/components/SimpleExpenseCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { newSimpleExpense } from "@/lib/constants";
import { firstDayOfCurrentMonth, formatDate } from "@/lib/utils";
import {
  Expense,
  InvoiceData,
  JobExpense,
  SimpleExpense,
  SubExpense,
} from "@/types";
import { CirclePlus, Eye, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface InvoiceEditorProps {
  initialData: InvoiceData;
  isNew?: boolean;
}

export default function InvoiceEditor({
  initialData,
  isNew = false,
}: InvoiceEditorProps) {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialData);
  const [expenses, setExpenses] = useState<Expense[]>(
    initialData.expenses || [],
  );
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    try {
      if (isNew) {
        getRemainingBalance().then((res) => {
          if (isMounted) {
            setInvoiceData((prev) => ({
              ...prev,
              prevBalanceAmount: res.amount,
              prevBalanceDate: res.date ? formatDate(res.date) : "",
            }));
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isNew]);

  const { calculatedTotal, calculatedRemaining, totalAdvanceOrBalance } =
    useMemo(() => {
      const total = expenses.reduce((acc, curr) => {
        if (curr.type === "job") {
          const subTotal =
            curr.subExpenses?.reduce(
              (s, c) => s + (Number(c.amount) || 0),
              0,
            ) || 0;
          return acc + (Number(curr.amount) || 0) + subTotal;
        }
        return acc + (Number(curr.amount) || 0);
      }, 0);

      const totalAdvanceOrBalance =
        (Number(invoiceData.prevBalanceAmount) || 0) +
        (Number(invoiceData.advanceAmount) || 0);

      const remaining = totalAdvanceOrBalance - total;

      return {
        calculatedTotal: total,
        calculatedRemaining: remaining,
        totalAdvanceOrBalance,
      };
    }, [expenses, invoiceData.advanceAmount, invoiceData.prevBalanceAmount]);

  const finalInvoiceData = {
    ...invoiceData,
    expenses,
    totalAmount: calculatedTotal,
    remainingAmount: calculatedRemaining,
  };

  const handleSave = async () => {
    setIsSaving(true);

    const toastId = toast.loading("Saving invoice...");

    try {
      const result = await saveInvoice(finalInvoiceData, isNew);

      if (result?.success) {
        toast.success(
          isNew
            ? "Invoice created successfully!"
            : "Invoice updated successfully!",
          { id: toastId },
        );
        router.push("/dashboard");
      } else {
        toast.error("Failed to save invoice: " + result?.error, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? ({ ...expense, ...updates } as Expense) : expense,
      ),
    );
  };

  const updateSubExpenses = (
    jobId: string,
    subId: string,
    updates: Partial<SubExpense>,
  ) => {
    setExpenses((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || job.type !== "job") return job;

        return {
          ...job,
          subExpenses: job.subExpenses.map((sub) =>
            sub.id === subId ? { ...sub, ...updates } : sub,
          ),
        };
      }),
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteSubExpense = (jobId: string, id: string) => {
    setExpenses((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || job.type !== "job") return job;

        return {
          ...job,
          subExpenses: job.subExpenses.filter((sub) => sub.id !== id),
        };
      }),
    );
  };

  const addSubExpense = (jobId: string) => {
    const newSubExpense: SubExpense = {
      id: crypto.randomUUID(),
      label: "",
      amount: 0,
    };

    setExpenses((prev) =>
      prev.map((job) =>
        job.id === jobId && job.type === "job"
          ? {
              ...job,
              subExpenses: [...job.subExpenses, newSubExpense],
            }
          : job,
      ),
    );
  };

  const addExpense = (expense: JobExpense | SimpleExpense) => {
    return setExpenses((prev) => [...prev, expense]);
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  if (loading) return <SkeletonCard />;

  return (
    <main className="bg-muted/90 min-h-screen pb-5">
      {!openPreview ? (
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex justify-between py-5">
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              {isNew ? "Create New Invoice" : "Edit Invoice"}
            </h1>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"default"}
                    className="hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-none"
                  >
                    <Save />
                    <span>{isSaving ? "Saving..." : "Save data"}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure to save this invoice?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Please ensure all expenses and employee details are
                      correct. This will officially record the invoice in the
                      system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave} disabled={isSaving}>
                      Save Invoice
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant={"default"}
                className="hover:scale-105"
                onClick={() => {
                  setInvoiceData({ ...invoiceData, expenses });
                  setOpenPreview(true);
                }}
              >
                <Eye />
                <span>Preview</span>
              </Button>
            </div>
          </div>
          <Card className="flex gap-5">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight text-balance">
                Invoice Details
              </CardTitle>
              <CardAction>
                <Button variant="destructive" onClick={clearAllExpenses}>
                  Clear all
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup className="grid grid-cols-3">
                  <Field className="col-span-1">
                    <FieldLabel>Port</FieldLabel>
                    <PortSelector
                      invoiceData={invoiceData}
                      setInvoiceData={setInvoiceData}
                    />
                  </Field>
                  <Field className="col-span-1">
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Name"
                      value={invoiceData.employeeName}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          employeeName: e.target.value,
                        })
                      }
                      className="uppercase"
                    />
                  </Field>
                  <Field className="col-span-1">
                    <FieldLabel>Date</FieldLabel>
                    <Input
                      type="date"
                      min={firstDayOfCurrentMonth}
                      value={formatDate(invoiceData.date)}
                      onChange={(e) =>
                        setInvoiceData({ ...invoiceData, date: e.target.value })
                      }
                      className="uppercase"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-2">
                  <Field className="col-span-1">
                    <FieldLabel>Balance Amount</FieldLabel>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0"
                      value={invoiceData.prevBalanceAmount || ""}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === ".") e.preventDefault();
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          prevBalanceAmount: Number(e.target.value),
                        })
                      }
                      className="uppercase"
                    />
                  </Field>
                  <Field className="col-span-1">
                    <FieldLabel>Balance Date</FieldLabel>
                    <Input
                      type="date"
                      min={firstDayOfCurrentMonth}
                      value={formatDate(invoiceData.prevBalanceDate)}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          prevBalanceDate: e.target.value,
                        })
                      }
                      className="uppercase"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-2">
                  <Field className="col-span-1">
                    <FieldLabel>Advance Amount</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="Advance"
                        placeholder="0"
                        value={invoiceData.advanceAmount || ""}
                        onChange={(e) =>
                          setInvoiceData({
                            ...invoiceData,
                            advanceAmount: Number(e.target.value),
                          })
                        }
                        className="uppercase"
                      />
                    </InputGroup>
                  </Field>
                  <Field className="col-span-1">
                    <FieldLabel>Advance Date</FieldLabel>
                    <Input
                      type="date"
                      min={firstDayOfCurrentMonth}
                      value={formatDate(invoiceData.advanceDate)}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          advanceDate: e.target.value,
                        })
                      }
                      className="uppercase"
                    />
                  </Field>
                </FieldGroup>

                <FieldSeparator />

                <div className="flex justify-between">
                  <FieldTitle className="text-xl font-semibold">
                    Expenses
                  </FieldTitle>

                  <div className="flex gap-2">
                    <AddJobButton addExpense={addExpense} />
                    <Button
                      variant={"default"}
                      onClick={() => addExpense(newSimpleExpense)}
                      className="text-xs bg-emerald-700 text-white hover:bg-emerald-600 hover:scale-105 focus:bg-emerald-600"
                    >
                      Add Simple <CirclePlus />
                    </Button>
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <FieldGroup className="p-10 flex justify-center items-center border-dashed border-2 border-gray-400 rounded-4xl">
                    <FieldDescription>No expenses added yet.</FieldDescription>
                  </FieldGroup>
                ) : (
                  expenses.map((expense, index) =>
                    expense.type === "job" ? (
                      <JobExpenseCard
                        key={expense.id}
                        {...expense}
                        index={index}
                        onUpdateExpense={(updates) => {
                          updateExpense(expense.id, updates);
                        }}
                        onUpdateSubExpense={(subId, updates) => {
                          updateSubExpenses(expense.id, subId, updates);
                        }}
                        onDeleteExpense={(id) => deleteExpense(id)}
                        onDeleteSubExpense={(id) =>
                          deleteSubExpense(expense.id, id)
                        }
                        onAddSubExpense={() => addSubExpense(expense.id)}
                      />
                    ) : (
                      <SimpleExpenseCard
                        key={expense.id}
                        {...expense}
                        index={index}
                        onUpdateExpense={(updates) =>
                          updateExpense(expense.id, updates)
                        }
                        onDeleteExpense={(id) => deleteExpense(id)}
                      />
                    ),
                  )
                )}
              </FieldSet>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <Preview
            data={finalInvoiceData}
            totalAdvanceOrBalance={totalAdvanceOrBalance}
            setOpenPreview={setOpenPreview}
          />
        </div>
      )}
    </main>
  );
}
