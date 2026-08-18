"use client";

import { useActionState } from "react";
import { updateTicket, type TicketFormState } from "../actions";
import { TICKET_STATUSES, TICKET_STATUS_LABELS } from "../status";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function EditTicketForm({
  ticketId,
  initial,
}: {
  ticketId: string;
  initial: {
    booking_ref: string | null;
    flight_info: string | null;
    status: string;
    notes: string | null;
  };
}) {
  const action = updateTicket.bind(null, ticketId) as (
    state: TicketFormState,
    formData: FormData,
  ) => Promise<TicketFormState>;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="booking_ref">
          Booking reference
        </label>
        <input
          id="booking_ref"
          name="booking_ref"
          defaultValue={initial.booking_ref ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="flight_info">
          Flight info
        </label>
        <input
          id="flight_info"
          name="flight_info"
          defaultValue={initial.flight_info ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={initial.status} className={fieldClass}>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TICKET_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
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
