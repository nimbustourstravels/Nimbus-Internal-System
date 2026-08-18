"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DocumentFormState = { error?: string };

export async function uploadDocument(
  clientId: string,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const file = formData.get("file");
  const docType = String(formData.get("doc_type") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const storagePath = `${clientId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("client-documents")
    .upload(storagePath, file);

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("client_documents").insert({
    client_id: clientId,
    storage_path: storagePath,
    doc_type: docType,
    uploaded_by: user?.id,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return {};
}

const SCANNABLE_FIELDS = new Set([
  "full_name",
  "nationality",
  "dob",
  "passport_number",
  "passport_expiry",
  "address",
  "father_name",
  "mother_name",
  "spouse_name",
]);

export async function applyScanToClient(clientId: string, fields: Record<string, unknown>) {
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([key, value]) => SCANNABLE_FIELDS.has(key) && value != null),
  );

  if (Object.keys(updates).length === 0) {
    return { error: "Nothing to update." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(updates).eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return {};
}

export async function deleteDocument(clientId: string, documentId: string, storagePath: string) {
  const supabase = await createClient();

  await supabase.storage.from("client-documents").remove([storagePath]);
  await supabase.from("client_documents").delete().eq("id", documentId);

  revalidatePath(`/clients/${clientId}`);
}
