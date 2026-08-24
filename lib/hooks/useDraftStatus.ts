"use client";

import { useState, useEffect } from "react";

export function useDraftStatus(draftKey: string = "invoice_draft_new") {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftDate, setDraftDate] = useState<string | null>(null);

  useEffect(() => {
    const checkDraft = () => {
      const savedDraft = localStorage.getItem(draftKey);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Check if there is actual data (at least one expense or a name)
          const hasData =
            (parsed.expenses && parsed.expenses.length > 0) ||
            (parsed.invoiceData && parsed.invoiceData.employeeName !== "");

          setHasDraft(hasData);

          if (hasData && parsed.invoiceData?.date) {
            setDraftDate(parsed.invoiceData.date);
          }
        } catch (error) {
          console.error("Error reading draft:", error);
          setHasDraft(false);
        }
      } else {
        setHasDraft(false);
      }
    };

    // Check on initial load
    checkDraft();

    // Optional: Listen for storage events (if the draft changes in another tab)
    window.addEventListener("storage", checkDraft);
    return () => window.removeEventListener("storage", checkDraft);
  }, [draftKey]);

  return { hasDraft, draftDate };
}
