import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SendMessageForm } from "./send-message-form";

export async function MessagesView({ withId }: { withId?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: colleagues } = await supabase
    .from("employees")
    .select("id, name")
    .neq("id", user?.id ?? "")
    .order("name");

  let thread: { id: string; sender_id: string; body: string; created_at: string }[] = [];
  if (withId && user) {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${withId}),and(sender_id.eq.${withId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true });
    thread = data ?? [];
  }

  const selected = colleagues?.find((c) => c.id === withId);

  return (
    <div className="flex max-w-3xl gap-4">
      <div className="w-48 shrink-0 rounded-lg border border-neutral-200 bg-white p-2">
        {colleagues?.map((c) => (
          <Link
            key={c.id}
            href={`/tasks?view=messages&with=${c.id}`}
            className={`block rounded-md px-3 py-2 text-sm ${
              withId === c.id ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {c.name}
          </Link>
        ))}
        {colleagues && colleagues.length === 0 && (
          <p className="px-3 py-2 text-sm text-neutral-400">No other employees yet.</p>
        )}
      </div>

      <div className="flex flex-1 flex-col rounded-lg border border-neutral-200 bg-white">
        {!selected ? (
          <p className="p-4 text-sm text-neutral-400">Pick a colleague to message.</p>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                    m.sender_id === user?.id
                      ? "ml-auto bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {m.body}
                </div>
              ))}
              {thread.length === 0 && (
                <p className="text-sm text-neutral-400">No messages yet — say hi.</p>
              )}
            </div>
            <div className="border-t border-neutral-200 p-2">
              <SendMessageForm recipientId={selected.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
