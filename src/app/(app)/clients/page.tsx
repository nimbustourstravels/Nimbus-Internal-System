import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ flagged?: string }>;
}) {
  const { flagged } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id, full_name, nationality, email, phone, flagged_for_followup")
    .order("full_name");

  if (flagged === "1") {
    query = query.eq("flagged_for_followup", true);
  }

  const { data: clients, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Client Management</h1>
        <Link
          href="/clients/new"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Client
        </Link>
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/clients"
          className={`rounded px-2 py-1 ${!flagged ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          All
        </Link>
        <Link
          href="/clients?flagged=1"
          className={`rounded px-2 py-1 ${flagged === "1" ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          Flagged for follow-up
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Nationality</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-900">
                  {client.full_name}
                  {client.flagged_for_followup && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                      Flagged
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-neutral-600">{client.nationality ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-600">{client.email ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-600">{client.phone ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/clients/${client.id}`} className="text-neutral-900 underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {clients && clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
