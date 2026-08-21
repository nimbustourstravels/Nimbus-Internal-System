"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Links two specific client records into the same family group. Deliberately
// keyed off an actual client (a real row), never a typed name — two unrelated
// families with the same surname must never get merged by a text match.
export async function linkClientToFamily(clientId: string, otherClientId: string) {
  if (!otherClientId || otherClientId === clientId) return;

  const supabase = await createClient();

  const { data: pair } = await supabase
    .from("clients")
    .select("id, full_name, group_id")
    .in("id", [clientId, otherClientId]);

  const me = pair?.find((c) => c.id === clientId);
  const other = pair?.find((c) => c.id === otherClientId);
  if (!me || !other) return;

  let groupId = me.group_id ?? other.group_id;

  if (!groupId) {
    const surname = me.full_name.trim().split(/\s+/).pop() ?? me.full_name;
    const { data: newGroup, error } = await supabase
      .from("client_groups")
      .insert({ name: `${surname} Family` })
      .select("id")
      .single();
    if (error || !newGroup) return;
    groupId = newGroup.id;
  }

  await supabase
    .from("clients")
    .update({ group_id: groupId })
    .in("id", [clientId, otherClientId]);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${otherClientId}`);
  revalidatePath("/clients");
}

export async function unlinkClientFromFamily(clientId: string) {
  const supabase = await createClient();
  await supabase.from("clients").update({ group_id: null }).eq("id", clientId);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
}

export async function renameFamilyGroup(groupId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const supabase = await createClient();
  await supabase.from("client_groups").update({ name: trimmed }).eq("id", groupId);
  revalidatePath("/clients");
}
