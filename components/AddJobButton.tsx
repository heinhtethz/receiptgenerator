"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jobTemplate } from "@/lib/constants";
import { JobExpense } from "@/types";
import { CirclePlus } from "lucide-react";

export function AddJobButton({
  addExpense,
}: {
  addExpense: (expense: JobExpense) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"default"}
          className="text-xs bg-blue-700 text-white hover:bg-blue-600 hover:scale-105 focus:bg-blue-600"
        >
          Add Job <CirclePlus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit flex-1 p-1 gap-1">
        <DropdownMenuGroup>
          {jobTemplate.map((item) => {
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => addExpense(item.job)}
              >
                <span className="text-sm font-mono font-semibold">
                  {item.name}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
