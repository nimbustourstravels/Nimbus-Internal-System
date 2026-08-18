import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogIntakeForm } from "./log-intake-form";
import { AssignRow } from "./assign-row";

export default async function IntakePage() {
  const supabase = await createClient();

  const [{ data: unmatched }, { data: confirmed }, { data: clients }] = await Promise.all([
    supabase
      .from("intake_emails")
      .select("id, from_address, raw_content, received_at")
      .eq("status", "unmatched")
      .order("received_at", { ascending: false }),
    supabase
      .from("intake_emails")
      .select("id, from_address, received_at, clients(id, full_name)")
      .eq("status", "confirmed")
      .order("received_at", { ascending: false })
      .limit(20),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Document Intake</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Automatic Gmail matching isn&apos;t connected yet — for now, log incoming client emails
        here manually and assign them to the right client.
      </p>

      <div className="mt-4 max-w-2xl rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Log an email</h2>
        <div className="mt-2">
          <LogIntakeForm />
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-neutral-900">
        Awaiting assignment ({unmatched?.length ?? 0})
      </h2>
      <ul className="mt-2 max-w-2xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {unmatched?.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div>
              <p className="text-neutral-900">{i.from_address}</p>
              {i.raw_content && (
                <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{i.raw_content}</p>
              )}
            </div>
            <AssignRow intakeId={i.id} clients={clients ?? []} />
          </li>
        ))}
        {unmatched && unmatched.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">
            Nothing awaiting assignment.
          </li>
        )}
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-neutral-900">Recently assigned</h2>
      <ul className="mt-2 max-w-2xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {confirmed?.map((i) => (
          <li key={i.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-neutral-900">{i.from_address}</span>
            {(i.clients as unknown as { id: string; full_name: string } | null) && (
              <Link
                href={`/clients/${(i.clients as unknown as { id: string; full_name: string }).id}`}
                className="text-neutral-900 underline"
              >
                {(i.clients as unknown as { id: string; full_name: string }).full_name}
              </Link>
            )}
          </li>
        ))}
        {confirmed && confirmed.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">Nothing assigned yet.</li>
        )}
      </ul>
    </div>
  );
}
