import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { usePDF } from "@react-pdf/renderer";
import { InvoiceData } from "@/types/index";
import { MyDocument } from "./MyDocument";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const formatDate = (d?: string) => {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear().toString().slice(-2)}`;
};

export const Preview = ({
  data,
  totalAdvanceOrBalance,
  setOpenPreview,
}: {
  data: InvoiceData;
  totalAdvanceOrBalance: number;
  setOpenPreview: Dispatch<SetStateAction<boolean>>;
}) => {
  const myDoc = useMemo(
    () => (
      <MyDocument
        data={data}
        total={data.totalAmount}
        advance={data.advanceAmount || 0}
        balance={data.prevBalanceAmount || 0}
        totalAdvanceOrBalance={totalAdvanceOrBalance}
        remaining={data.remainingAmount}
        formatDate={formatDate}
      />
    ),
    [data, totalAdvanceOrBalance],
  );

  const [instance, updateInstance] = usePDF({ document: myDoc });

  useEffect(() => {
    updateInstance(myDoc);
  }, [myDoc, updateInstance]);

  return (
    <div>
      <div className="bg-muted/40 flex justify-between py-5">
        <h2 className="font-bold text-2xl">Preview</h2>
        <div className="flex gap-2">
          <Button variant={"outline"} onClick={() => setOpenPreview(false)}>
            Back to Edit
          </Button>
          <Button asChild>
            <a
              href={instance.url || "#"}
              download={`${formatDate(data.date)}_${data.port || "MIP"}_Expense.pdf`}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-3xl mx-auto bg-white text-zinc-950 font-sans shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          {/* 1. Header Section */}
          <div className="flex flex-row justify-between items-end mb-4 border-b pb-4">
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {data.port || ""}
            </h2>
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {data.employeeName || ""}
            </h2>
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {formatDate(data.date)}
            </h2>
          </div>

          {/* Advance / Balance Details under Port */}
          {(data.advanceAmount ||
            data.prevBalanceAmount ||
            data.advanceDate ||
            data.prevBalanceDate) && (
            <div className="flex flex-row justify-center items-center gap-4 mt-6 mb-8 text-sm font-bold text-zinc-800 tracking-wide">
              {data.prevBalanceAmount && data.prevBalanceAmount > 0 ? (
                <div className="flex flex-col items-center">
                  <span>
                    BAL - {data.prevBalanceAmount.toLocaleString()}
                    /-
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {data.prevBalanceDate
                      ? `(${formatDate(data.prevBalanceDate)})`
                      : ""}
                  </span>
                </div>
              ) : null}

              {data.advanceAmount && data.prevBalanceAmount ? (
                <span className="text-center px-2 text-zinc-500">+</span>
              ) : null}

              {data.advanceAmount && data.advanceAmount > 0 ? (
                <div className="flex flex-col items-center">
                  <span>ADV - {data.advanceAmount.toLocaleString()}/- </span>
                  <span className="text-muted-foreground font-medium">
                    {data.advanceDate
                      ? `(${formatDate(data.advanceDate)})`
                      : ""}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* 2. Expenses List Section */}
          <div className="mt-8 space-y-6">
            {data.expenses &&
              data.expenses.map((expense, idx) => (
                <div key={expense.id || idx} className="flex flex-col">
                  {/* Main Expense Line */}
                  <div className="flex flex-row justify-between items-start">
                    <span className="w-10 font-bold text-sm">{idx + 1}.</span>
                    <span className="flex-1 pr-4 font-bold text-sm uppercase tracking-wide whitespace-pre-wrap">
                      {expense.description}
                    </span>
                    <span className="w-32 text-right font-bold text-sm tracking-wider">
                      {expense.amount > 0 ? expense.amount.toLocaleString() : 0}
                    </span>
                  </div>

                  {/* Sub Expenses */}
                  {expense.type === "job" &&
                    expense.subExpenses &&
                    expense.subExpenses.map((sub, sIdx) => (
                      <div
                        key={sub.id || sIdx}
                        className="flex flex-row justify-between items-center ml-10 mt-2 text-zinc-600 text-xs uppercase tracking-wide"
                      >
                        <span>{sub.label}</span>
                        <span className="w-32 text-right font-normal tracking-wider">
                          {sub.amount > 0 ? sub.amount.toLocaleString() : 0}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
          </div>

          {/* 3. Footer Section (TOTAL, ADVANCE, BALANCE) */}
          <div className="mt-16 flex justify-end">
            <div className="w-72 border-t-2 border-black pt-4">
              <div className="flex flex-row justify-between mb-3 text-sm font-bold tracking-wide">
                <span>TOTAL</span>
                <span>{data.totalAmount.toLocaleString()}/-</span>
              </div>

              <div className="flex flex-row justify-between mb-3 text-sm font-bold tracking-wide">
                <span>ADVANCE</span>
                <span>{totalAdvanceOrBalance.toLocaleString()}/-</span>
              </div>

              <div className="flex flex-row justify-between mt-2 pt-3 border-t-2 border-zinc-400 text-sm font-bold tracking-wider">
                <span>
                  {data.totalAmount >= totalAdvanceOrBalance
                    ? "CLAIM"
                    : "BALANCE"}
                </span>
                <span>{data.remainingAmount.toLocaleString()}/-</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
