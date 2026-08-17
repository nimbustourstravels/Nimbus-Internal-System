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
};

export function ScanAndCreate() {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedFields | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanError(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/ocr/passport", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setScanError(json.error ?? "Could not scan this passport.");
        return;
      }

      setScanned({
        full_name: json.full_name ?? undefined,
        nationality: json.nationality ?? undefined,
        dob: json.dob ?? undefined,
        passport_number: json.passport_number ?? undefined,
        passport_expiry: json.passport_expiry ?? undefined,
      });
      setFormKey((k) => k + 1);
    } catch {
      setScanError("Something went wrong scanning this image.");
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="max-w-2xl rounded-lg border border-dashed border-neutral-300 bg-white p-4">
        <label className="text-sm font-medium text-neutral-700" htmlFor="passport-scan">
          Scan passport to auto-fill (optional)
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Upload a clear photo of the passport&apos;s photo page. Fields below will be
          pre-filled — review them before saving.
        </p>
        <input
          id="passport-scan"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={scanning}
          className="mt-2 text-sm"
        />
        {scanning && <p className="mt-2 text-sm text-neutral-500">Scanning…</p>}
        {scanError && <p className="mt-2 text-sm text-red-600">{scanError}</p>}
        {scanned && !scanning && (
          <p className="mt-2 text-sm text-green-700">Scanned — review the fields below.</p>
        )}
      </div>

      <div className="mt-4">
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
