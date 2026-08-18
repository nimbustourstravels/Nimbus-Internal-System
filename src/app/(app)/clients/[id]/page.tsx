import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "../client-form";
import { updateClientRecord } from "../actions";
import { DocumentsSection } from "./documents-section";
import { VISA_STATUS_LABELS, VISA_STATUS_COLORS, type VisaStatus } from "../../visa/status";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  type TicketStatus,
} from "../../tickets/status";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();

  if (!client) {
    notFound();
  }

  const { data: documents } = await supabase
    .from("client_documents")
    .select("id, storage_path, doc_type, uploaded_at")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });

  const { data: visaCases } = await supabase
    .from("visa_cases")
    .select("id, visa_type, status")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, booking_ref, flight_info, status")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const [{ data: signed }, { data: signedDownload }] = await Promise.all([
        supabase.storage.from("client-documents").createSignedUrl(doc.storage_path, 60 * 10),
        supabase.storage
          .from("client-documents")
          .createSignedUrl(doc.storage_path, 60 * 10, { download: true }),
      ]);
      return {
        ...doc,
        url: signed?.signedUrl ?? null,
        downloadUrl: signedDownload?.signedUrl ?? null,
      };
    }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{client.full_name}</h1>
        <p className="text-sm text-neutral-500">Client profile</p>
      </div>

      <ClientForm
        key={JSON.stringify(client)}
        action={updateClientRecord.bind(null, client.id)}
        initial={client}
        submitLabel="Save changes"
      />

      <DocumentsSection clientId={client.id} documents={documentsWithUrls} />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Visa Cases</h2>
          <Link
            href={`/visa/new?client_id=${client.id}`}
            className="text-sm text-neutral-900 underline"
          >
            New visa case
          </Link>
        </div>
        <ul className="mt-2 max-w-xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {visaCases?.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <Link href={`/visa/${c.id}`} className="text-neutral-900 underline">
                {c.visa_type}
              </Link>
              <span
                className={`rounded px-2 py-0.5 text-xs ${VISA_STATUS_COLORS[c.status as VisaStatus]}`}
              >
                {VISA_STATUS_LABELS[c.status as VisaStatus]}
              </span>
            </li>
          ))}
          {visaCases && visaCases.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-400">
              No visa cases yet.
            </li>
          )}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Tickets</h2>
          <Link
            href={`/tickets/new?client_id=${client.id}`}
            className="text-sm text-neutral-900 underline"
          >
            New ticket
          </Link>
        </div>
        <ul className="mt-2 max-w-xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {tickets?.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <Link href={`/tickets/${t.id}`} className="text-neutral-900 underline">
                {t.flight_info || t.booking_ref || "Ticket"}
              </Link>
              <span
                className={`rounded px-2 py-0.5 text-xs ${TICKET_STATUS_COLORS[t.status as TicketStatus]}`}
              >
                {TICKET_STATUS_LABELS[t.status as TicketStatus]}
              </span>
            </li>
          ))}
          {tickets && tickets.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-400">No tickets yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
