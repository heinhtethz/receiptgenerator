"use client";

import { deleteInvoice } from "@/app/actions/invoice";
import Link from "next/link";
import { FilePlus, Trash } from "lucide-react";
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
import { InvoiceData } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
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
// React.Fragment သုံးဖို့ React ကို import လုပ်ပါ
import React, { useMemo, useState } from "react";
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
      toast.error("Failed to delete invoice:");
    }
  };

  return (
    <div className="grid grid-cols-8 gap-4 pt-4">
      <Button variant={"default"} className="col-start-8" asChild>
        <Link href={"/invoice/new"}>
          <span>Add Invoice</span>
          <FilePlus className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <Card className="col-span-8">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            A detailed list of all recorded invoices and their attached
            expenses.
          </CardDescription>
          <CardAction>
            <SearchInvoiceData
              searchQuery={searchQuery}
              searchType={searchType}
              setSearchQuery={setSearchQuery}
              setSearchType={setSearchType}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead className="text-right">Total (MMK)</TableHead>
                  <TableHead className="text-right">Balance (MMK)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showingInvoiceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  showingInvoiceData.map((group) => (
                    <React.Fragment key={group.monthYear}>
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={7}
                          className="font-semibold py-2 text-primary"
                        >
                          {group.monthYear}
                        </TableCell>
                      </TableRow>

                      {group.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/invoice/${invoice.id}`}
                              className="hover:underline"
                            >
                              {invoice.id}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{invoice.employeeName}</TableCell>
                          <TableCell>{invoice.port}</TableCell>
                          <TableCell className="text-right">
                            {invoice.totalAmount.toLocaleString()}
                          </TableCell>

                          <TableCell
                            className={`text-right font-medium ${
                              invoice.remainingAmount > 0
                                ? "text-green-500"
                                : "text-red-500"
                            } `}
                          >
                            {invoice.remainingAmount.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the invoice for{" "}
                                    <span className="font-semibold">
                                      {invoice.employeeName}
                                    </span>{" "}
                                    and remove its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(invoice.id)}
                                    variant={"destructive"}
                                  >
                                    Delete Invoice
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDataOnDashboard;
