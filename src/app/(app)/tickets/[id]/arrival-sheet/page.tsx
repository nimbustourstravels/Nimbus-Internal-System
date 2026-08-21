import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/print-button";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-neutral-200 py-2">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-sm text-neutral-900">{value?.trim() || "—"}</div>
    </div>
  );
}

type Passenger = {
  full_name: string;
  dob: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default async function ArrivalSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, booking_ref, flight_info, status")
    .eq("id", id)
    .single();

  if (!ticket) {
    notFound();
  }

  const { data: passengerLinks } = await supabase
    .from("ticket_clients")
    .select(
      "clients(full_name, dob, nationality, passport_number, passport_expiry, email, phone, address)",
    )
    .eq("ticket_id", id);

  const passengers = (passengerLinks ?? [])
    .map((p) => p.clients as unknown as Passenger | null)
    .filter((p): p is Passenger => p !== null);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/tickets/${ticket.id}`} className="text-sm text-neutral-500 underline">
          ← Back to ticket
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 print:border-0 print:p-0">
        <h1 className="text-lg font-semibold text-neutral-900">Pre-Arrival Info Sheet</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Reference only. Use this to fill out Air Suvidha or the destination&apos;s arrival
          form yourself — this is not a submission to any portal.
        </p>

        <h2 className="mt-6 text-sm font-semibold text-neutral-900">Travel</h2>
        <Field label="Booking reference" value={ticket.booking_ref} />
        <Field label="Flight info" value={ticket.flight_info} />
        <Field label="Status" value={ticket.status} />

        {passengers.map((p, i) => (
          <div key={i}>
            <h2 className="mt-6 text-sm font-semibold text-neutral-900">
              Traveller {passengers.length > 1 ? i + 1 : ""} — {p.full_name}
            </h2>
            <Field label="Full name" value={p.full_name} />
            <Field label="Date of birth" value={p.dob} />
            <Field label="Nationality" value={p.nationality} />
            <Field label="Passport number" value={p.passport_number} />
            <Field label="Passport expiry" value={p.passport_expiry} />
            <Field label="Phone" value={p.phone} />
            <Field label="Email" value={p.email} />
            <Field label="Address" value={p.address} />
          </div>
        ))}

        {passengers.length === 0 && (
          <p className="mt-6 text-sm text-neutral-400">No passengers on this ticket yet.</p>
        )}
      </div>
    </div>
  );
}
