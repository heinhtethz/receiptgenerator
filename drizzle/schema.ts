import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgSchema,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const authSchema = pgSchema("auth");

const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  port: text("port").notNull(),
  employeeName: text("employee_name").notNull(),
  date: timestamp("date").notNull(),
  advanceAmount: integer("advance_amount"),
  advanceDate: timestamp("advance_date"),
  prevBalanceAmount: integer("prev_balance_amount"),
  prevBalanceDate: timestamp("prev_balance_date"),
  totalAmount: integer("total_amount").notNull(),
  remainingAmount: integer("remaining_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobExpenses = pgTable("job_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
});

export const subExpenses = pgTable("sub_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobExpenseId: uuid("job_expense_id")
    .notNull()
    .references(() => jobExpenses.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  amount: integer("amount").notNull(),
});

export const simpleExpenses = pgTable("simple_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date"),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(authUsers, {
    fields: [invoices.userId],
    references: [authUsers.id],
  }),
  jobExpenses: many(jobExpenses),
  simpleExpenses: many(simpleExpenses),
}));

export const jobExpensesRelations = relations(jobExpenses, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [jobExpenses.invoiceId],
    references: [invoices.id],
  }),
  subExpenses: many(subExpenses),
}));

export const subExpensesRelations = relations(subExpenses, ({ one }) => ({
  jobExpense: one(jobExpenses, {
    fields: [subExpenses.jobExpenseId],
    references: [jobExpenses.id],
  }),
}));

export const simpleExpensesRelations = relations(simpleExpenses, ({ one }) => ({
  invoice: one(invoices, {
    fields: [simpleExpenses.invoiceId],
    references: [invoices.id],
  }),
}));
