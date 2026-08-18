"use client";

import { useState } from "react";
import { ClientForm, type ClientRecord } from "../client-form";
import { createClientRecord } from "../actions";
import { ScanSlot } from "@/components/scan-slot";

export function ScanAndCreate() {
  const [scanned, setScanned] = useState<Partial<ClientRecord> | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  function mergeScanned(fields: Record<string, unknown>) {
    setScanned((prev) => ({ ...prev, ...(fields as Partial<ClientRecord>) }));
    setFormKey((k) => k + 1);
  }

  return (
    <div>
      <div className="flex max-w-3xl flex-col gap-4 sm:flex-row">
        <ScanSlot
          id="passport-scan-front"
          label="Scan passport photo page (optional)"
          hint="Photo + machine-readable lines at the bottom. Fills name, nationality, DOB, passport number, expiry."
          endpoint="/api/ocr/passport"
          onScanned={mergeScanned}
        />
        <ScanSlot
          id="passport-scan-last"
          label="Scan passport last / address page (optional)"
          hint="Indian passports only. Fills address, father's/mother's/spouse's name — less precise, always double-check."
          endpoint="/api/ocr/passport-last-page"
          onScanned={mergeScanned}
        />
      </div>

      <div className="mt-4 max-w-2xl">
        <ClientForm key={formKey} action={createClientRecord} initial={scanned} submitLabel="Create client" />
      </div>
    </div>
  );
}
