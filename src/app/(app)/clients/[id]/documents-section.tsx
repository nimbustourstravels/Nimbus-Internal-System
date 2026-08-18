"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, deleteDocument, applyScanToClient } from "./documents-actions";
import { ScanSlot } from "@/components/scan-slot";

type Document = {
  id: string;
  storage_path: string;
  doc_type: string | null;
  uploaded_at: string;
  url: string | null;
  downloadUrl: string | null;
};

const DOC_TYPES = [
  "Passport - Photo Page",
  "Passport - Last Page",
  "Aadhaar Card",
  "PAN Card",
  "Visa Copy",
  "Photo",
  "Bank Statement",
  "Other",
];

function DocTypeField() {
  const [selected, setSelected] = useState(DOC_TYPES[0]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-neutral-700" htmlFor="doc_type_select">
        Document type
      </label>
      <select
        id="doc_type_select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
      >
        {DOC_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {selected === "Other" ? (
        <input
          name="doc_type"
          placeholder="Custom type"
          className="mt-1 block rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      ) : (
        <input type="hidden" name="doc_type" value={selected} />
      )}
    </div>
  );
}

export function DocumentsSection({
  clientId,
  documents,
}: {
  clientId: string;
  documents: Document[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(uploadDocument.bind(null, clientId), {});

  async function handleScanned(fields: Record<string, unknown>) {
    await applyScanToClient(clientId, fields);
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900">Documents</h2>

      <div className="mt-2 flex max-w-3xl flex-col gap-4 sm:flex-row">
        <ScanSlot
          id={`scan-front-${clientId}`}
          label="Scan passport photo page"
          hint="Updates name, nationality, DOB, passport number, expiry on this client."
          endpoint="/api/ocr/passport"
          onScanned={handleScanned}
        />
        <ScanSlot
          id={`scan-last-${clientId}`}
          label="Scan passport last / address page"
          hint="Updates address, father's/mother's/spouse's name — review after scanning."
          endpoint="/api/ocr/passport-last-page"
          onScanned={handleScanned}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Scanning above only updates the client&apos;s fields — use the upload form below to also
        save the file itself.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2">
        <DocTypeField />
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="file">
            File
          </label>
          <input id="file" name="file" type="file" required className="text-sm" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

      <ul className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <div>
              <span className="text-neutral-900">{doc.doc_type ?? "Document"}</span>
              <span className="ml-2 text-neutral-400">
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-900 underline"
                >
                  View
                </a>
              )}
              {doc.downloadUrl && (
                <a href={doc.downloadUrl} className="text-neutral-900 underline">
                  Download
                </a>
              )}
              <button
                onClick={() => deleteDocument(clientId, doc.id, doc.storage_path)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {documents.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">No documents yet.</li>
        )}
      </ul>
    </div>
  );
}
