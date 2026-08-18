"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(recipientId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    body: trimmed,
  });

  revalidatePath("/tasks");
}
