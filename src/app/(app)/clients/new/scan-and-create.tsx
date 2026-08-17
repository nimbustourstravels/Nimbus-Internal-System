"use client";

import { useState } from "react";
import { ClientForm } from "../client-form";
import { createClientRecord } from "../actions";

type ScannedFields = {
  full_name?: string;
  nationality?: string;
  dob?: string;
  passport_number?: string;
  passport_expiry?: string;
  address?: string;
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
};

function ScanSlot({
  id,
  label,
  hint,
  endpoint,
  onScanned,
}: {
  id: string;
  label: string;
  hint: string;
  endpoint: string;
  onScanned: (fields: Partial<ScannedFields>) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setDone(false);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch(endpoint, { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Could not scan this page.");
        return;
      }

      const cleaned = Object.fromEntries(
        Object.entries(json).filter(([, v]) => v != null),
      ) as Partial<ScannedFields>;
      onScanned(cleaned);
      setDone(true);
    } catch {
      setError("Something went wrong scanning this image.");
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex-1 rounded-lg border border-dashed border-neutral-300 bg-white p-4">
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
      </label>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={scanning}
        className="mt-2 text-sm"
      />
      {scanning && <p className="mt-2 text-sm text-neutral-500">Scanning…</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {done && !scanning && (
        <p className="mt-2 text-sm text-green-700">Scanned — review the fields below.</p>
      )}
    </div>
  );
}

export function ScanAndCreate() {
  const [scanned, setScanned] = useState<ScannedFields | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  function mergeScanned(fields: Partial<ScannedFields>) {
    setScanned((prev) => ({ ...prev, ...fields }));
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
        <ClientForm
          key={formKey}
          action={createClientRecord}
          initial={scanned}
          submitLabel="Create client"
        />
      </div>
    </div>
  );
}
