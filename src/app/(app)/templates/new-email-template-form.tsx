"use client";

import { useActionState } from "react";
import { createEmailTemplate } from "./email-actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function NewEmailTemplateForm() {
  const [state, formAction, pending] = useActionState(createEmailTemplate, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass} htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Schengen document request"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass} htmlFor="visa_type_scope">
            Visa type (optional)
          </label>
          <input id="visa_type_scope" name="visa_type_scope" className={fieldClass} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="subject">
          Subject *
        </label>
        <input
          id="subject"
          name="subject"
          required
          placeholder="Documents needed for your {{visa_type}} application"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="body">
          Body *
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          placeholder="Hi {{client_name}}, ..."
          className={fieldClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save template"}
      </button>
    </form>
  );
}
