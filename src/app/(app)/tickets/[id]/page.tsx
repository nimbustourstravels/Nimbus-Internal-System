import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditTicketForm } from "./edit-ticket-form";
import { PassengersSection } from "./passengers-section";
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, type TicketStatus } from "../status";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, booking_ref, flight_info, status, notes")
    .eq("id", id)
    .single();

  if (!ticket) {
    notFound();
  }

  const [{ data: passengerLinks }, { data: allClients }] = await Promise.all([
    supabase.from("ticket_clients").select("clients(id, full_name)").eq("ticket_id", id),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  const passengers = (passengerLinks ?? [])
    .map((p) => p.clients as unknown as { id: string; full_name: string } | null)
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const passengerIds = new Set(passengers.map((p) => p.id));
  const addableClients = (allClients ?? []).filter((c) => !passengerIds.has(c.id));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-neutral-500">
          {passengers.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link href={`/clients/${p.id}`} className="underline">
                {p.full_name}
              </Link>
            </span>
          ))}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-neutral-900">
            {ticket.flight_info || ticket.booking_ref || "Ticket"}
          </h1>
          <span
            className={`rounded px-2 py-0.5 text-xs ${TICKET_STATUS_COLORS[ticket.status as TicketStatus]}`}
          >
            {TICKET_STATUS_LABELS[ticket.status as TicketStatus]}
          </span>
        </div>
      </div>

      <EditTicketForm
        ticketId={ticket.id}
        initial={{
          booking_ref: ticket.booking_ref,
          flight_info: ticket.flight_info,
          status: ticket.status,
          notes: ticket.notes,
        }}
      />

      <PassengersSection ticketId={ticket.id} passengers={passengers} addableClients={addableClients} />

      <div>
        <Link
          href={`/tickets/${ticket.id}/arrival-sheet`}
          className="text-sm text-neutral-900 underline"
        >
          Pre-Arrival Info Sheet →
        </Link>
        <p className="mt-1 text-xs text-neutral-500">
          A printable summary of each passenger&apos;s passport, contact, and flight info — for
          filling out Air Suvidha or the destination&apos;s arrival form yourself.
        </p>
      </div>
    </div>
  );
}
