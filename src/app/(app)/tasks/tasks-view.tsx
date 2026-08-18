import { createClient } from "@/lib/supabase/server";
import { NewTaskForm } from "./new-task-form";
import { TaskRow } from "./task-row";

export async function TasksView() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: employees }, { data: clients }, { data: tasks }] = await Promise.all([
    supabase.from("employees").select("id, name").order("name"),
    supabase.from("clients").select("id, full_name").order("full_name"),
    supabase
      .from("tasks")
      .select(
        "id, description, status, due_date, escalated, assigned_to, employees!tasks_assigned_to_fkey(name), clients(full_name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="max-w-2xl rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">New Task</h2>
        <div className="mt-2">
          <NewTaskForm employees={employees ?? []} clients={clients ?? []} />
        </div>
      </div>

      <ul className="mt-4 max-w-2xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {tasks?.map((t) => (
          <TaskRow
            key={t.id}
            id={t.id}
            description={t.description}
            status={t.status}
            dueDate={t.due_date}
            escalated={t.escalated}
            assignedToName={
              (t.employees as unknown as { name: string } | null)?.name ?? "Unassigned"
            }
            clientName={(t.clients as unknown as { full_name: string } | null)?.full_name ?? null}
            isMine={t.assigned_to === user?.id}
          />
        ))}
        {tasks && tasks.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">No tasks yet.</li>
        )}
      </ul>
    </div>
  );
}
