"use client";

import { useActionState } from "react";
import type { ClientFormState } from "./actions";

type ClientRecord = {
  full_name: string;
  nationality: string | null;
  dob: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  notes: string | null;
  flagged_for_followup: boolean;
};

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  initial?: Partial<ClientRecord>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <label className={labelClass} htmlFor="full_name">
            Full name *
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={initial?.full_name}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="nationality">
            Nationality
          </label>
          <input
            id="nationality"
            name="nationality"
            defaultValue={initial?.nationality ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="dob">
            Date of birth
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            defaultValue={initial?.dob ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={initial?.phone ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label className={labelClass} htmlFor="address">
            Address
          </label>
          <input
            id="address"
            name="address"
            defaultValue={initial?.address ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="passport_number">
            Passport number
          </label>
          <input
            id="passport_number"
            name="passport_number"
            defaultValue={initial?.passport_number ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="passport_expiry">
            Passport expiry
          </label>
          <input
            id="passport_expiry"
            name="passport_expiry"
            type="date"
            defaultValue={initial?.passport_expiry ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label className={labelClass} htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            id="flagged_for_followup"
            name="flagged_for_followup"
            type="checkbox"
            defaultChecked={initial?.flagged_for_followup}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <label className="text-sm text-neutral-700" htmlFor="flagged_for_followup">
            Flag for follow-up
          </label>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
