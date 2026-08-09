import { JobExpense, SimpleExpense } from "@/types";

export const newImportJob: JobExpense = {
  id: crypto.randomUUID(),
  type: "job",
  description: "IMP: NEW IMPORT JOB",
  amount: 0,
  subExpenses: [
    { id: "1", label: "STORAGE", amount: 0 },
    { id: "2", label: "MAIL/COPY", amount: 3000 },
    { id: "3", label: "SURVEY", amount: 2000 },
    { id: "4", label: "TRUCK IN", amount: 1000 },
  ],
};

export const newImportExamJob: JobExpense = {
  id: crypto.randomUUID(),
  type: "job",
  description: "IMP: NEW IMPORT EXAM JOB",
  amount: 0,
  subExpenses: [
    { id: "1", label: "STORAGE", amount: 0 },
    { id: "2", label: "MAIL/COPY", amount: 0 },
    { id: "3", label: "SURVEY", amount: 2000 },
    { id: "4", label: "EO", amount: 10000 },
    { id: "5", label: "CLERK/AD/APPR/CEO", amount: 8000 },
    { id: "6", label: "SEAL", amount: 3000 },
    { id: "7", label: "LABOUR", amount: 0 },
    { id: "8", label: "BAUNG", amount: 1000 },
    { id: "9", label: "TRUCK IN", amount: 1000 },
  ],
};

export const newExportJob: JobExpense = {
  id: crypto.randomUUID(),
  type: "job",
  description: "EXP: NEW EXPORT JOB",
  amount: 0,
  subExpenses: [
    { id: "1", label: "STORAGE", amount: 0 },
    { id: "2", label: "MAIL/COPY", amount: 3000 },
    { id: "3", label: "TRUCK IN", amount: 1000 },
  ],
};

export const newExportExamJob: JobExpense = {
  id: crypto.randomUUID(),
  type: "job",
  description: "EXP: NEW EXPORT EXAM JOB",
  amount: 0,
  subExpenses: [
    { id: "1", label: "STORAGE", amount: 0 },
    { id: "2", label: "MAIL/COPY", amount: 0 },
    { id: "3", label: "TRUCK IN", amount: 1000 },
    { id: "4", label: "EO", amount: 10000 },
    { id: "5", label: "CLERK/AD/APPR/CEO", amount: 8000 },
    { id: "7", label: "LABOUR", amount: 0 },
    { id: "8", label: "BAUNG", amount: 1000 },
  ],
};

export const jobTemplate = [
  { id: 1, name: "Add Import Job", job: newImportJob },
  { id: 2, name: "Add Import Exam Job", job: newImportExamJob },
  { id: 3, name: "Add Export Job", job: newExportJob },
  { id: 4, name: "Add Export Exam Job", job: newExportExamJob },
];

export const newSimpleExpense: SimpleExpense = {
  id: crypto.randomUUID(),
  type: "simple",
  description: "",
  amount: 0,
  date: "",
};
