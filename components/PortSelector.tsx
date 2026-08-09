"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InvoiceData } from "@/types";
import { Dispatch, SetStateAction } from "react";

const ports = ["MIP", "AWPT", "MITT", "TMITT"] as const;

export function PortSelector({
  invoiceData,
  setInvoiceData,
}: {
  invoiceData: InvoiceData;
  setInvoiceData: Dispatch<SetStateAction<InvoiceData>>;
}) {
  return (
    <Combobox
      items={ports}
      value={invoiceData.port || ""}
      onValueChange={(val) =>
        setInvoiceData({ ...invoiceData, port: val || "" })
      }
    >
      <ComboboxInput placeholder="Select a port" />
      <ComboboxContent>
        <ComboboxEmpty>No ports found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
