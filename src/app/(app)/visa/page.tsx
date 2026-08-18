import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VISA_STATUSES, VISA_STATUS_LABELS, VISA_STATUS_COLORS, type VisaStatus } from "./status";

export default async function VisaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("visa_cases")
    .select("id, visa_type, status, submission_date, clients(full_name)")
    .order("created_at", { ascending: false });

  if (status && VISA_STATUSES.includes(status as VisaStatus)) {
    query = query.eq("status", status);
  }

  const { data: cases, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Visa</h1>
        <Link
          href="/visa/new"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Visa Case
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/visa"
          className={`rounded px-2 py-1 ${!status ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          All
        </Link>
        {VISA_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/visa?status=${s}`}
            className={`rounded px-2 py-1 ${status === s ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            {VISA_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Visa Type</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cases?.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-900">
                  {(c.clients as unknown as { full_name: string } | null)?.full_name ?? "—"}
                </td>
                <td className="px-4 py-2 text-neutral-600">{c.visa_type}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${VISA_STATUS_COLORS[c.status as VisaStatus]}`}
                  >
                    {VISA_STATUS_LABELS[c.status as VisaStatus]}
                  </span>
                </td>
                <td className="px-4 py-2 text-neutral-600">
                  {c.submission_date
                    ? new Date(c.submission_date).toLocaleDateString("en-GB")
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/visa/${c.id}`} className="text-neutral-900 underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {cases && cases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No visa cases yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
