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
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 min-h-[calc(100dvh-4rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </span>
          {user?.email && (
            <span className="text-sm sm:text-lg font-normal text-muted-foreground truncate max-w-70 sm:max-w-none">
              ({user.email})
            </span>
          )}
        </h2>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Advance (Balance)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                amount > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              ${amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {date ? formatDate(date) : "Across all generated invoices"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invoices Issued
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total lifetime invoices
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked complex expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Invoice Data Table/List */}
      <InvoiceDataOnDashboard invoices={invoices} />
    </div>
  );
}
