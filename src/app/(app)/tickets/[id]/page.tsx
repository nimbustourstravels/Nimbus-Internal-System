import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditTicketForm } from "./edit-ticket-form";
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, type TicketStatus } from "../status";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, booking_ref, flight_info, status, notes, client_id, clients(id, full_name)")
    .eq("id", id)
    .single();

  if (!ticket) {
    notFound();
  }

  const client = ticket.clients as unknown as { id: string; full_name: string } | null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-neutral-500">
          {client && (
            <Link href={`/clients/${client.id}`} className="underline">
              {client.full_name}
            </Link>
          )}
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
    </div>
  );
}
