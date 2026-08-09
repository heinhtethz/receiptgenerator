import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Dispatch, SetStateAction } from "react";

const items = [
  { label: "Employee Name", value: "name" },
  { label: "Port", value: "port" },
  { label: "Date", value: "date" },
];

export function SearchInvoiceData({
  searchQuery,
  searchType,
  setSearchQuery,
  setSearchType,
}: {
  searchQuery: string;
  searchType: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setSearchType: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex w-full items-center">
      <Select
        value={searchType}
        onValueChange={(value) => setSearchType(value)}
      >
        <SelectTrigger className="w-30 md:w-40">
          <SelectValue placeholder="Search by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        type="search"
        value={searchQuery}
        placeholder={
          searchType === "date"
            ? `Search by ${searchType} (YYYY-MM-DD)`
            : `Search by ${searchType}`
        }
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-40 md:w-60 text-sm"
      />
    </div>
  );
}
