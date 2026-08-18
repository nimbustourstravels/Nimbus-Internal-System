"use client";

import { assignIntakeEmail } from "./actions";

export function AssignRow({
  intakeId,
  clients,
}: {
  intakeId: string;
  clients: { id: string; full_name: string }[];
}) {
  return (
    <select
      defaultValue=""
      onChange={(e) => assignIntakeEmail(intakeId, e.target.value)}
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
    >
      <option value="" disabled>
        Assign to client…
      </option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {c.full_name}
        </option>
      ))}
    </select>
  );
}
