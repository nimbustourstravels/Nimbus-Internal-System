"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ClientFormState = { error?: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function resolveGroupId(
  supabase: SupabaseServerClient,
  groupName: string,
): Promise<string | null> {
  if (!groupName) return null;

  const { data: existing } = await supabase
    .from("client_groups")
    .select("id")
    .ilike("name", groupName)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("client_groups")
    .insert({ name: groupName })
    .select("id")
    .single();

  return error ? null : created.id;
}

function readClientForm(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    nationality: String(formData.get("nationality") ?? "").trim() || null,
    dob: String(formData.get("dob") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    passport_number: String(formData.get("passport_number") ?? "").trim() || null,
    passport_expiry: String(formData.get("passport_expiry") ?? "").trim() || null,
    father_name: String(formData.get("father_name") ?? "").trim() || null,
    mother_name: String(formData.get("mother_name") ?? "").trim() || null,
    spouse_name: String(formData.get("spouse_name") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    flagged_for_followup: formData.get("flagged_for_followup") === "on",
  };
}

export async function createClientRecord(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const values = readClientForm(formData);
  const groupName = String(formData.get("group_name") ?? "").trim();

  if (!values.full_name) {
    return { error: "Full name is required." };
  }

  const supabase = await createClient();
  const groupId = await resolveGroupId(supabase, groupName);

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...values, group_id: groupId })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientRecord(
  clientId: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const values = readClientForm(formData);
  const groupName = String(formData.get("group_name") ?? "").trim();

  if (!values.full_name) {
    return { error: "Full name is required." };
  }

  const supabase = await createClient();
  const groupId = await resolveGroupId(supabase, groupName);

  const { error } = await supabase
    .from("clients")
    .update({ ...values, group_id: groupId })
    .eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  return {};
}
