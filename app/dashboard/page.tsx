import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Receipt } from "lucide-react";
import InvoiceDataOnDashboard from "@/components/InvoiceDataOnDashboard";
import { getAllInvoice, getRemainingBalance } from "../actions/invoice";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { invoices, user } = await getAllInvoice();
  const { amount, date } = await getRemainingBalance();

  const totalInvoices = invoices.length;

  const totalExpenses = invoices.reduce(
    (acc, inv) => acc + (inv.expenses?.length || 0),
    0,
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-muted/40">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight">Dashboard</span>
          <span className="text-xl font-light">( {user?.email} )</span>
        </h2>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Advance (Balance)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${amount > 0 ? "text-green-500" : " text-black"}`}
            >
              {amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {date ? formatDate(date) : "Across all generated invoices"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invoices Issued
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Total lifetime invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Tracked complex expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <InvoiceDataOnDashboard invoices={invoices} />
    </div>
  );
}
