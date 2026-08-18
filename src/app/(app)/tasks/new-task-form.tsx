"use client";

import { useActionState } from "react";
import { createTask } from "./actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function NewTaskForm({
  employees,
  clients,
}: {
  employees: { id: string; name: string }[];
  clients: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTask, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelClass} htmlFor="assigned_to">
            Assign to *
          </label>
          <select id="assigned_to" name="assigned_to" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select employee
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="client_id">
            Client (optional)
          </label>
          <select id="client_id" name="client_id" defaultValue="" className={fieldClass}>
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="description">
          Description *
        </label>
        <input id="description" name="description" required className={fieldClass} />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="due_date">
          Due date
        </label>
        <input id="due_date" name="due_date" type="date" className={fieldClass} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create task"}
      </button>
    </form>
  );
}
