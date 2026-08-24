"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus, Trash, Edit3, Send } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "./ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
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
} from "./ui/alert-dialog";
import { InvoiceData } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { deleteInvoice } from "@/app/actions/invoice";
import { SearchInvoiceData } from "./SearchInvoiceData";
import { useDraftStatus } from "@/lib/hooks/useDraftStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Component to check and render row-level draft badges
function InvoiceRowDraftBadge({ invoiceId }: { invoiceId: string }) {
  const [hasEditDraft, setHasEditDraft] = useState(false);

  useEffect(() => {
    const checkDraft = () => {
      const savedDraft = localStorage.getItem(`invoice_draft_${invoiceId}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const hasContent =
            (parsed.expenses && parsed.expenses.length > 0) ||
            Boolean(parsed.invoiceData?.employeeName?.trim());
          setHasEditDraft(hasContent);
        } catch {
          setHasEditDraft(false);
        }
      } else {
        setHasEditDraft(false);
      }
    };

    checkDraft();
    window.addEventListener("storage", checkDraft);
    return () => window.removeEventListener("storage", checkDraft);
  }, [invoiceId]);

  if (!hasEditDraft) return null;

  return (
    <span
      style={{
        backgroundColor: "#fef3c7",
        color: "#92400e",
        borderColor: "#fde68a",
      }}
      className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold"
    >
      Draft
    </span>
  );
}

const InvoiceDataOnDashboard = ({ invoices }: { invoices: InvoiceData[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");

  // Draft indicator for "Add Invoice" button
  const { hasDraft } = useDraftStatus("invoice_draft_new");

  const showingInvoiceData = useMemo(() => {
    const filtered = invoices.filter((invoice) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();

      if (searchType === "name") {
        return invoice.employeeName.toLowerCase().includes(query);
      }
      if (searchType === "port") {
        return invoice.port.toLowerCase().includes(query);
      }
      if (searchType === "date") {
        const formattedDate = formatDate(invoice.date).toLowerCase();
        const rawDate = String(invoice.date).toLowerCase();
        return formattedDate.includes(query) || rawDate.includes(query);
      }
      return true;
    });

    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );

    const groups: Record<string, InvoiceData[]> = {};

    sorted.forEach((invoice) => {
      const dateObj = new Date(invoice.date);
      const monthYear = dateObj.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(invoice);
    });

    return Object.entries(groups).map(([monthYear, invoices]) => ({
      monthYear,
      invoices,
    }));
  }, [invoices, searchQuery, searchType]);

  const handleDelete = async (invoiceId: string) => {
    const result = await deleteInvoice(invoiceId);

    if (result?.success) {
      // Clear any remaining draft for this invoice from storage
      localStorage.removeItem(`invoice_draft_${invoiceId}`);
      toast.success("Invoice deleted successfully!");
    } else {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="hidden text-lg font-semibold tracking-tight sm:block">
          Manage Invoices
        </h3>

        <div className="relative ml-auto inline-flex w-full sm:w-auto">
          <Button variant="default" className="w-full sm:w-auto" asChild>
            <Link
              href="/invoice/new"
              className="flex items-center justify-center"
            >
              <span>Add Invoice</span>
              <FilePlus className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* Shadcn UI Tooltip on Draft Dot */}
          {hasDraft && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Unsaved draft available"
                    style={{
                      position: "absolute",
                      top: "-3px",
                      right: "-3px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#f59e0b",
                      borderRadius: "9999px",
                      border: "2px solid #ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      zIndex: 50,
                    }}
                  >
                    <span className="sr-only">Unsaved draft available</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="text-xs">
                  <p className="font-medium">Unsaved draft</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-col justify-between gap-4 space-y-0 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              A detailed list of all recorded invoices and their attached
              expenses.
            </CardDescription>
          </div>
          <CardAction className="w-full sm:w-auto">
            <SearchInvoiceData
              searchQuery={searchQuery}
              searchType={searchType}
              setSearchQuery={setSearchQuery}
              setSearchType={setSearchType}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 sm:pt-0">
          {showingInvoiceData.length === 0 ? (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
              No invoices found.
            </div>
          ) : (
            showingInvoiceData.map((group) => (
              <div key={group.monthYear} className="mb-6 last:mb-0">
                <div className="mb-3 rounded-md bg-muted/60 px-3 py-2 text-sm font-semibold text-primary">
                  {group.monthYear}
                </div>

                {/* 1. Mobile Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {group.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Id :{" "}
                            <span className="font-bold">
                              {invoice.id.slice(-6)}
                            </span>
                          </span>
                          <InvoiceRowDraftBadge invoiceId={invoice.id} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            asChild
                          >
                            <Link href={`/invoice/${invoice.id}`}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <DeleteDialog
                            employeeName={invoice.employeeName}
                            onConfirm={() => handleDelete(invoice.id)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-3 text-xs sm:text-sm">
                        <div className="flex items-center">
                          <span className="w-28 text-muted-foreground">
                            Date
                          </span>
                          <span className="font-medium">
                            : {formatDate(invoice.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-28 text-muted-foreground">
                            Employee
                          </span>
                          <span className="font-medium">
                            : {invoice.employeeName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-28 text-muted-foreground">
                            Port
                          </span>
                          <span className="font-medium">: {invoice.port}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-28 text-muted-foreground">
                            Total
                          </span>
                          <span className="font-semibold">
                            : {invoice.totalAmount.toLocaleString()} MMK
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-28 text-muted-foreground">
                            Balance
                          </span>
                          <span
                            className={`font-semibold ${
                              invoice.remainingAmount > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            : {invoice.remainingAmount.toLocaleString()} MMK
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/40 bg-muted/20 p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full text-xs text-primary hover:bg-primary/10"
                          asChild
                        >
                          <Link href={`/invoice/${invoice.id}`}>
                            <span>View Details</span>
                            <Send className="ml-1.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Desktop Table */}
                <div className="hidden rounded-md border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Port</TableHead>
                        <TableHead className="text-right">
                          Total (MMK)
                        </TableHead>
                        <TableHead className="text-right">
                          Balance (MMK)
                        </TableHead>
                        <TableHead className="w-12.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/invoice/${invoice.id}`}
                                className="text-primary hover:underline"
                              >
                                {invoice.id}
                              </Link>
                              <InvoiceRowDraftBadge invoiceId={invoice.id} />
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{invoice.employeeName}</TableCell>
                          <TableCell>{invoice.port}</TableCell>
                          <TableCell className="text-right font-medium">
                            {invoice.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              invoice.remainingAmount > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            {invoice.remainingAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DeleteDialog
                              employeeName={invoice.employeeName}
                              onConfirm={() => handleDelete(invoice.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function DeleteDialog({
  employeeName,
  onConfirm,
}: {
  employeeName: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] rounded-lg sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            invoice for{" "}
            <span className="font-semibold text-foreground">
              {employeeName}
            </span>{" "}
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            Delete Invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default InvoiceDataOnDashboard;
