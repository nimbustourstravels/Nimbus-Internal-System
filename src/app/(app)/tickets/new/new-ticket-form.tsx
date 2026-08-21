"use client";

import { useActionState } from "react";
import { createTicket } from "../actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

type ClientOption = { id: string; full_name: string; group_name: string | null };

export function NewTicketForm({
  clients,
  defaultClientId,
}: {
  clients: ClientOption[];
  defaultClientId?: string;
}) {
  const [state, formAction, pending] = useActionState(createTicket, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className={labelClass}>Passengers *</label>
        <div className="max-h-56 overflow-y-auto rounded-md border border-neutral-300 p-2">
          {clients.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-50"
            >
              <input
                type="checkbox"
                name="client_ids"
                value={c.id}
                defaultChecked={c.id === defaultClientId}
                className="h-4 w-4 rounded border-neutral-300"
              />
              {c.full_name}
              {c.group_name && (
                <span className="text-xs text-neutral-400">({c.group_name})</span>
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          Select everyone travelling on this booking — one ticket can cover a whole family.
        </p>
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
