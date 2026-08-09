import { formatDate } from "@/lib/utils";
import { getInvoiceById, getRemainingBalance } from "../../actions/invoice";
import InvoiceEditor from "./InvoiceEditor";
import { InvoiceData } from "@/types";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let invoiceData: InvoiceData;

  if (isNew) {
    const { amount, date } = await getRemainingBalance();
    invoiceData = {
      id: "",
      port: "",
      employeeName: "",
      date: formatDate(new Date()),
      advanceAmount: 0,
      advanceDate: "",
      prevBalanceAmount: amount || 0,
      prevBalanceDate: formatDate(date),
      totalAmount: 0,
      remainingAmount: 0,
      expenses: [],
    };
  } else {
    const data = await getInvoiceById(id);

    if (!data) {
      return (
        <main className="p-10 text-center bg-muted/40">
          <h1 className="text-2xl font-bold text-destructive">
            Invoice Not Found
          </h1>
          <p>The invoice you are looking for does not exist.</p>
        </main>
      );
    }

    invoiceData = data as unknown as InvoiceData;
  }

  return (
    <main>
      <InvoiceEditor initialData={invoiceData} isNew={isNew} />
    </main>
  );
}
