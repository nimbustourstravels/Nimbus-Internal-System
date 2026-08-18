"use client";

import { useActionState } from "react";
import { createChecklistTemplate } from "./checklist-actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function NewChecklistTemplateForm() {
  const [state, formAction, pending] = useActionState(createChecklistTemplate, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="visa_type">
          Visa type *
        </label>
        <input
          id="visa_type"
          name="visa_type"
          required
          placeholder="e.g. Schengen Tourist"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="required_doc_types">
          Required documents (one per line) *
        </label>
        <textarea
          id="required_doc_types"
          name="required_doc_types"
          required
          rows={5}
          placeholder={"Passport - Photo Page\nBank Statement\nVisa Copy"}
          className={fieldClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save checklist"}
      </button>
    </form>
  );
}
