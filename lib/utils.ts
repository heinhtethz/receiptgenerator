import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const now = new Date();
export const firstDayOfCurrentMonth = new Date(
  now.getFullYear(),
  now.getMonth(),
  1,
)
  .toISOString()
  .split("T")[0];

export function formatDate(
  dateValue: string | Date | undefined | null,
): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
