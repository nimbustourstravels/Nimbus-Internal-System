"use client";

import { useActionState } from "react";
import { updateVisaCase, type VisaFormState } from "../actions";
import { VISA_STATUSES, VISA_STATUS_LABELS } from "../status";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function EditVisaCaseForm({
  caseId,
  initial,
}: {
  caseId: string;
  initial: {
    visa_type: string;
    status: string;
    submission_date: string | null;
    notes: string | null;
  };
}) {
  const action = updateVisaCase.bind(null, caseId) as (
    state: VisaFormState,
    formData: FormData,
  ) => Promise<VisaFormState>;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="visa_type">
          Visa type *
        </label>
        <input
          id="visa_type"
          name="visa_type"
          required
          defaultValue={initial.visa_type}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={initial.status} className={fieldClass}>
          {VISA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VISA_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="submission_date">
          Submission date
        </label>
        <input
          id="submission_date"
          name="submission_date"
          type="date"
          defaultValue={initial.submission_date ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial.notes ?? ""}
          className={fieldClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
