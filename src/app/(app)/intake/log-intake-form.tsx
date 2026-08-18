"use client";

import { useActionState } from "react";
import { logIntakeEmail } from "./actions";

const fieldClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "text-sm font-medium text-neutral-700";

export function LogIntakeForm() {
  const [state, formAction, pending] = useActionState(logIntakeEmail, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="from_address">
          Sender email *
        </label>
        <input id="from_address" name="from_address" type="email" required className={fieldClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass} htmlFor="raw_content">
          Content / notes
        </label>
        <textarea id="raw_content" name="raw_content" rows={3} className={fieldClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Logging…" : "Log email"}
      </button>
    </form>
  );
}
