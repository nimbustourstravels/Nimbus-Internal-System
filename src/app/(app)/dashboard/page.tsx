import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: myTasks }, { data: flaggedClients }] = await Promise.all([
    supabase.from("tasks").select("status, due_date").eq("assigned_to", user?.id ?? ""),
    supabase
      .from("clients")
      .select("id, full_name")
      .eq("flagged_for_followup", true)
      .order("full_name"),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const pending = (myTasks ?? []).filter((t) => t.status !== "done").length;
  const completed = (myTasks ?? []).filter((t) => t.status === "done").length;
  const overdue = (myTasks ?? []).filter(
    (t) => t.status !== "done" && t.due_date && t.due_date < today,
  ).length;

  const stats = [
    { label: "Pending Tasks", value: pending },
    { label: "Completed", value: completed },
    { label: "Overdue", value: overdue, alert: overdue > 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">My Dashboard</h1>

      <div className="mt-4 grid max-w-2xl grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className={`text-2xl font-semibold ${s.alert ? "text-red-600" : "text-neutral-900"}`}>
              {s.value}
            </p>
            <p className="mt-1 text-sm text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 max-w-2xl">
        <h2 className="text-sm font-semibold text-neutral-900">Flagged for follow-up</h2>
        <ul className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {flaggedClients?.map((c) => (
            <li key={c.id} className="px-4 py-2 text-sm">
              <Link href={`/clients/${c.id}`} className="text-neutral-900 underline">
                {c.full_name}
              </Link>
            </li>
          ))}
          {flaggedClients && flaggedClients.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-400">
              No flagged clients.
            </li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <Link href="/tasks" className="text-sm text-neutral-900 underline">
          View all my tasks →
        </Link>
      </div>
    </div>
  );
}
