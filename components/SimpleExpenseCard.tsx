import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Expense, SimpleExpense } from "@/types";
import { Input } from "./ui/input";
import { firstDayOfCurrentMonth, formatDate } from "@/lib/utils";

type SimpleExpenseProps = SimpleExpense & {
  index: number;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (updates: Partial<Expense>) => void;
};

const SimpleExpenseCard = ({
  id,
  type,
  description,
  amount,
  date,
  index,
  onDeleteExpense,
  onUpdateExpense,
}: SimpleExpenseProps) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex gap-2">
          <span className="text-blue-700 text-sm font-bold bg-blue-100 rounded-full w-fit p-2 h-6 flex items-center justify-center">
            {index + 1}
          </span>
          <span className="uppercase text-emerald-700 text-[10px] font-bold bg-emerald-100 rounded-xl w-fit p-2 h-6 flex items-center justify-center">
            {type}
          </span>
        </CardTitle>
        <CardAction>
          <Button variant={"destructive"} onClick={() => onDeleteExpense(id)}>
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <FieldGroup className="grid grid-cols-2 sm:grid-cols-4">
          <Field className="col-span-2">
            <FieldLabel className="font-bold">Simple Title</FieldLabel>
            <Input
              id="job-title"
              value={description.toUpperCase() || ""}
              placeholder="Type your simple expense here"
              onChange={(e) =>
                onUpdateExpense({
                  description: e.target.value.toUpperCase().trim(),
                })
              }
              className="text-xs"
            />
          </Field>
          <Field className="col-span-1">
            <FieldLabel className="font-bold">Amount</FieldLabel>
            <Input
              id="Amount"
              type="number"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === ".") e.preventDefault();
              }}
              onWheel={(e) => e.currentTarget.blur()}
              value={amount || ""}
              onChange={(e) => {
                onUpdateExpense({ amount: Number(e.target.value) });
              }}
              className="text-xs"
            />
          </Field>
          <Field className="col-span-1">
            <FieldLabel className="font-bold">Date</FieldLabel>
            <Input
              type="date"
              id="date-picker"
              min={firstDayOfCurrentMonth}
              value={formatDate(date) || ""}
              onChange={(e) => onUpdateExpense({ date: e.target.value })}
              className="uppercase text-xs"
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

export default SimpleExpenseCard;
