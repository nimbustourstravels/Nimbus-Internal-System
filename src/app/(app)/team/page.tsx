import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (me?.role !== "admin") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Team</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This dashboard is only visible to admins.
        </p>
      </div>
    );
  }

  const [{ data: employees }, { data: tasks }] = await Promise.all([
    supabase.from("employees").select("id, name, role").order("name"),
    supabase.from("tasks").select("assigned_to, status, due_date"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const rows = (employees ?? []).map((e) => {
    const theirTasks = (tasks ?? []).filter((t) => t.assigned_to === e.id);
    const pending = theirTasks.filter((t) => t.status !== "done").length;
    const completed = theirTasks.filter((t) => t.status === "done").length;
    const overdue = theirTasks.filter(
      (t) => t.status !== "done" && t.due_date && t.due_date < today,
    ).length;
    return { ...e, pending, completed, overdue };
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Team</h1>

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Employee</th>
              <th className="px-4 py-2 font-medium">Pending</th>
              <th className="px-4 py-2 font-medium">Completed</th>
              <th className="px-4 py-2 font-medium">Overdue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-900">
                  {r.name}
                  {r.role === "admin" && (
                    <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-white">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-neutral-600">{r.pending}</td>
                <td className="px-4 py-2 text-neutral-600">{r.completed}</td>
                <td className="px-4 py-2">
                  <span className={r.overdue > 0 ? "text-red-600" : "text-neutral-600"}>
                    {r.overdue}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
