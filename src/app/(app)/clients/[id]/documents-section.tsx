"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, deleteDocument, applyScanToClient } from "./documents-actions";

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

const OCR_ENDPOINTS: Record<string, string> = {
  "Passport - Photo Page": "/api/ocr/passport",
  "Passport - Last Page": "/api/ocr/passport-last-page",
};

export function DocumentsSection({
  clientId,
  documents,
}: {
  clientId: string;
  documents: Document[];
}) {
  const router = useRouter();
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [customType, setCustomType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rawScanText, setRawScanText] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    const finalDocType = docType === "Other" ? customType.trim() || "Other" : docType;

    setUploading(true);
    setError(null);
    setNotice(null);
    setRawScanText(null);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("doc_type", finalDocType);

    const uploadResult = await uploadDocument(clientId, {}, uploadFormData);
    if (uploadResult.error) {
      setError(uploadResult.error);
      setUploading(false);
      return;
    }

    const ocrEndpoint = OCR_ENDPOINTS[docType];
    if (ocrEndpoint) {
      const ocrFormData = new FormData();
      ocrFormData.append("file", file);

      try {
        const res = await fetch(ocrEndpoint, { method: "POST", body: ocrFormData });
        const json = await res.json();

        if (res.ok) {
          await applyScanToClient(clientId, json);
          setNotice("Uploaded and scanned — client fields updated below, please review.");
        } else {
          setNotice(`Uploaded, but couldn't scan it: ${json.error ?? "unknown error"}`);
          if (json.rawText) setRawScanText(json.rawText);
        }
      } catch {
        setNotice("Uploaded, but scanning failed.");
      }
    } else {
      setNotice("Uploaded.");
    }

    form.reset();
    setDocType(DOC_TYPES[0]);
    setCustomType("");
    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900">Documents</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Uploading a passport photo page or last page also scans it and updates this client&apos;s
        fields automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="doc_type_select">
            Document type
          </label>
          <select
            id="doc_type_select"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {docType === "Other" && (
            <input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Custom type"
              className="mt-1 block rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="file">
            File
          </label>
          <input id="file" name="file" type="file" required className="text-sm" />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-2 text-sm text-green-700">{notice}</p>}
      {rawScanText && (
        <details className="mt-2 max-w-2xl text-sm text-neutral-600">
          <summary className="cursor-pointer text-neutral-500">
            Show raw scanned text (didn&apos;t match any known field)
          </summary>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-2 text-xs">
            {rawScanText}
          </pre>
        </details>
      )}

      <ul className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <div>
              <span className="text-neutral-900">{doc.doc_type ?? "Document"}</span>
              <span className="ml-2 text-neutral-400">
                {new Date(doc.uploaded_at).toLocaleDateString("en-GB")}
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
