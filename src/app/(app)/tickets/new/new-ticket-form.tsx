"use client";

import { useActionState } from "react";
import { createTicket } from "../actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function NewTicketForm({
  clients,
  defaultClientId,
}: {
  clients: { id: string; full_name: string }[];
  defaultClientId?: string;
}) {
  const [state, formAction, pending] = useActionState(createTicket, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="client_id">
          Client *
        </label>
        <select
          id="client_id"
          name="client_id"
          required
          defaultValue={defaultClientId ?? ""}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="booking_ref">
          Booking reference
        </label>
        <input id="booking_ref" name="booking_ref" className={fieldClass} />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="flight_info">
          Flight info
        </label>
        <input
          id="flight_info"
          name="flight_info"
          placeholder="e.g. AI 101, DEL-JFK, 12 Sep"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className={fieldClass} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
