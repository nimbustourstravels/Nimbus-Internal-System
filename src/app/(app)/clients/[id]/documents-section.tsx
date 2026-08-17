"use client";

import { useActionState } from "react";
import { uploadDocument, deleteDocument } from "./documents-actions";

type Document = {
  id: string;
  storage_path: string;
  doc_type: string | null;
  uploaded_at: string;
  url: string | null;
};

export function DocumentsSection({
  clientId,
  documents,
}: {
  clientId: string;
  documents: Document[];
}) {
  const [state, formAction, pending] = useActionState(uploadDocument.bind(null, clientId), {});

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900">Documents</h2>

      <form action={formAction} className="mt-2 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="doc_type">
            Document type
          </label>
          <input
            id="doc_type"
            name="doc_type"
            placeholder="e.g. Passport copy"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="file">
            File
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="text-sm"
          />
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
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-neutral-900 underline">
                  View
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
