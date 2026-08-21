"use client";

import Link from "next/link";
import { useState } from "react";
import { linkClientToFamily, unlinkClientFromFamily, renameFamilyGroup } from "./family-actions";

type Candidate = {
  id: string;
  full_name: string;
  dob: string | null;
  passport_number: string | null;
};

export function FamilySection({
  clientId,
  groupId,
  groupName,
  members,
  candidates,
}: {
  clientId: string;
  groupId: string | null;
  groupName: string | null;
  members: { id: string; full_name: string }[];
  candidates: Candidate[];
}) {
  const [selected, setSelected] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(groupName ?? "");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Family / Group{groupName && !renaming && <> — {groupName}</>}
        </h2>
        {groupId && !renaming && (
          <button
            onClick={() => setRenaming(true)}
            className="text-xs text-neutral-500 hover:underline"
          >
            Rename
          </button>
        )}
      </div>

      {groupId && renaming && (
        <div className="mt-2 flex max-w-md gap-2">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              renameFamilyGroup(groupId, nameDraft);
              setRenaming(false);
            }}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save
          </button>
        </div>
      )}

      {groupId ? (
        <ul className="mt-2 max-w-xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <Link href={`/clients/${m.id}`} className="text-neutral-900 underline">
                {m.full_name}
              </Link>
              <button
                onClick={() => unlinkClientFromFamily(m.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Unlink
              </button>
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-400">
              No other members linked yet.
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">Not linked to a family group yet.</p>
      )}

      {candidates.length > 0 && (
        <div className="mt-2 flex max-w-xl gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Link with another client…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
                {c.dob ? ` — DOB ${c.dob}` : ""}
                {c.passport_number ? ` — Passport ${c.passport_number}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!selected) return;
              linkClientToFamily(clientId, selected);
              setSelected("");
            }}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Link
          </button>
        </div>
      )}
      <p className="mt-1 text-xs text-neutral-500">
        Each option shows date of birth / passport number so you can tell apart clients who
        share a surname.
      </p>
    </div>
  );
}
