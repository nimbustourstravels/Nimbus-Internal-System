"use client";

import { setTaskStatus, escalateTask } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskRow({
  id,
  description,
  status,
  dueDate,
  escalated,
  assignedToName,
  clientName,
  isMine,
}: {
  id: string;
  description: string;
  status: string;
  dueDate: string | null;
  escalated: boolean;
  assignedToName: string;
  clientName: string | null;
  isMine: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <div>
        <p className={`text-neutral-900 ${status === "done" ? "line-through opacity-60" : ""}`}>
          {description}
          {escalated && (
            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
              Escalated
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {assignedToName}
          {clientName && <> · {clientName}</>}
          {dueDate && <> · Due {new Date(dueDate).toLocaleDateString("en-GB")}</>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <select
          value={status}
          onChange={(e) => setTaskStatus(id, e.target.value as "open" | "in_progress" | "done")}
          disabled={!isMine}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs disabled:opacity-50"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {!escalated && (
          <button onClick={() => escalateTask(id)} className="text-xs text-red-600 hover:underline">
            Escalate
          </button>
        )}
      </div>
    </li>
  );
}
