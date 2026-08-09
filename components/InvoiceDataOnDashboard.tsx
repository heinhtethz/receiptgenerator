"use client";

import React, { useMemo, useState } from "react";
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

const InvoiceDataOnDashboard = ({ invoices }: { invoices: InvoiceData[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");

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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
      toast.success("Invoice deleted successfully!");
    } else {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight hidden sm:block">
          Manage Invoices
        </h3>
        <Button variant="default" className="w-full sm:w-auto ml-auto" asChild>
          <Link href="/invoice/new">
            <span>Add Invoice</span>
            <FilePlus className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
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
            <div className="p-8 text-center text-muted-foreground border rounded-md">
              No invoices found.
            </div>
          ) : (
            showingInvoiceData.map((group) => (
              <div key={group.monthYear} className="mb-6 last:mb-0">
                {/* Month/Year Group Header */}
                <div className="text-sm font-semibold text-primary bg-muted/60 px-3 py-2 rounded-md mb-3">
                  {group.monthYear}
                </div>

                {/* 1. Mobile Key-Value Card Layout (Matched with Image UI) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {group.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden flex flex-col"
                    >
                      {/* Card Header: ID & Action Buttons */}
                      <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border/50">
                        <span className="font-semibold text-sm">
                          Id :{" "}
                          <span className="font-bold">
                            {invoice.id.slice(-6)}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
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

                      {/* Card Body: Aligned Key-Value Pairs */}
                      <div className="p-3 flex flex-col gap-1.5 text-xs sm:text-sm">
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
                            className={`font-semibold : ${
                              invoice.remainingAmount > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            : {invoice.remainingAmount.toLocaleString()} MMK
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Full Width Action Bar */}
                      <div className="p-2 bg-muted/20 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-primary hover:bg-primary/10 h-8"
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

                {/* 2. Desktop Table Layout (>= 768px) */}
                <div className="hidden md:block rounded-md border">
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
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/invoice/${invoice.id}`}
                              className="hover:underline text-primary"
                            >
                              {invoice.id}
                            </Link>
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
          className="h-7 w-7 text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-lg">
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
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
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
