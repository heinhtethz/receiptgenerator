export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  accounts: Account[];
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
}

export interface SubExpense {
  id: string;
  label: string;
  amount: number;
}

export interface JobExpense {
  id: string;
  type: "job";
  description: string;
  amount: number;
  subExpenses: SubExpense[];
}

export interface SimpleExpense {
  id: string;
  type: "simple";
  description: string;
  amount: number;
  date: string;
}

export type Expense = JobExpense | SimpleExpense;

export interface InvoiceData {
  id: string;
  port: string;
  employeeName: string;
  date: string;
  advanceAmount?: number;
  advanceDate?: string;
  prevBalanceAmount?: number;
  prevBalanceDate?: string;
  totalAmount: number;
  remainingAmount: number;
  expenses: Expense[];
  createdAt?: string;
  updateAt?: string;
}
