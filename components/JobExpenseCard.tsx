import { CirclePlus, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Textarea } from "./ui/textarea";
import { Expense, JobExpense, SubExpense } from "@/types";
import { Input } from "./ui/input";

type Props = JobExpense & {
  index: number;
  onUpdateExpense: (updates: Partial<Expense>) => void;
  onUpdateSubExpense: (subId: string, updates: Partial<SubExpense>) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteSubExpense: (id: string) => void;
  onAddSubExpense: () => void;
};

const JobExpenseCard = ({
  id,
  type,
  index,
  description,
  amount,
  subExpenses,
  onUpdateExpense,
  onUpdateSubExpense,
  onDeleteExpense,
  onDeleteSubExpense,
  onAddSubExpense,
}: Props) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex gap-2">
          <span className="text-blue-700 text-sm font-bold bg-blue-100 rounded-full w-fit p-2 h-6 flex items-center justify-center">
            {index + 1}
          </span>
          <span className="uppercase text-blue-700 text-xs font-bold bg-blue-100 rounded-xl w-fit p-2 h-6 flex items-center justify-center">
            {type}
          </span>
        </CardTitle>
        <CardAction>
          <Button
            variant={"destructive"}
            size="sm"
            onClick={() => onDeleteExpense(id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Changed to mobile-first stacking grid */}
        <FieldGroup className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field className="md:col-span-3">
            <FieldLabel className="font-bold">Job Title</FieldLabel>
            <Textarea
              id="job-title"
              value={description.toUpperCase() || ""}
              placeholder="Type your job here."
              onChange={(e) =>
                onUpdateExpense({ description: e.target.value.toUpperCase() })
              }
              className="resize-none min-h-10 font-bold w-full text-sm"
            />
          </Field>
          <Field className="md:col-span-1">
            <FieldLabel className="font-bold">Base Amount</FieldLabel>
            <Input
              id="Base Amount"
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
              className="w-full text-sm font-bold"
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3">
          {subExpenses.map((subExpense) => {
            return (
              <FieldGroup
                key={subExpense.id}
                className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 md:p-0 rounded-lg md:bg-transparent"
              >
                <Field className="md:col-span-3">
                  <Input
                    id="extra"
                    placeholder="Label"
                    value={subExpense.label.toUpperCase() || ""}
                    onChange={(e) =>
                      onUpdateSubExpense(subExpense.id, {
                        label: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full text-xs"
                  />
                </Field>
                <Field className="md:col-span-1">
                  <div className="flex sm:gap-2">
                    <Input
                      id="extra amount"
                      placeholder="0"
                      type="number"
                      value={subExpense.amount || ""}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === ".") e.preventDefault();
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        onUpdateSubExpense(subExpense.id, {
                          amount: Number(e.target.value),
                        })
                      }
                      className="w-full flex-1 text-xs"
                    />

                    <Button
                      variant={"destructive"}
                      onClick={() => {
                        onDeleteSubExpense(subExpense.id);
                      }}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            );
          })}
        </div>

        <Button
          variant={"ghost"}
          className="text-xs text-blue-700 w-fit self-start mt-2"
          onClick={onAddSubExpense}
        >
          ADD ROW <CirclePlus className="ml-1 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobExpenseCard;
