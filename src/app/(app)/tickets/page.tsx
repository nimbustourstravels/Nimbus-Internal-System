import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  type TicketStatus,
} from "./status";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("tickets")
    .select("id, booking_ref, flight_info, status, clients(full_name)")
    .order("created_at", { ascending: false });

  if (status && TICKET_STATUSES.includes(status as TicketStatus)) {
    query = query.eq("status", status);
  }

  const { data: tickets, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Tickets</h1>
        <Link
          href="/tickets/new"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Ticket
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/tickets"
          className={`rounded px-2 py-1 ${!status ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          All
        </Link>
        {TICKET_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/tickets?status=${s}`}
            className={`rounded px-2 py-1 ${status === s ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            {TICKET_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Booking Ref</th>
              <th className="px-4 py-2 font-medium">Flight</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tickets?.map((t) => (
              <tr key={t.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-900">
                  {(t.clients as unknown as { full_name: string } | null)?.full_name ?? "—"}
                </td>
                <td className="px-4 py-2 text-neutral-600">{t.booking_ref ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-600">{t.flight_info ?? "—"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${TICKET_STATUS_COLORS[t.status as TicketStatus]}`}
                  >
                    {TICKET_STATUS_LABELS[t.status as TicketStatus]}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/tickets/${t.id}`} className="text-neutral-900 underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {tickets && tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No tickets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
