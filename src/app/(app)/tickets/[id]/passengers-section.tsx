"use client";

import Link from "next/link";
import { useState } from "react";
import { addPassenger, removePassenger } from "../actions";

export function PassengersSection({
  ticketId,
  passengers,
  addableClients,
}: {
  ticketId: string;
  passengers: { id: string; full_name: string }[];
  addableClients: { id: string; full_name: string }[];
}) {
  const [selected, setSelected] = useState("");

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900">Passengers</h2>
      <ul className="mt-2 max-w-xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {passengers.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <Link href={`/clients/${p.id}`} className="text-neutral-900 underline">
              {p.full_name}
            </Link>
            <button
              onClick={() => removePassenger(ticketId, p.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
        {passengers.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">No passengers.</li>
        )}
      </ul>

      {addableClients.length > 0 && (
        <div className="mt-2 flex max-w-xl gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Add a passenger…</option>
            {addableClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!selected) return;
              addPassenger(ticketId, selected);
              setSelected("");
            }}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
