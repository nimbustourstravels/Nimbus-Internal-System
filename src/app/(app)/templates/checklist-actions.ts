"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ChecklistTemplateFormState = { error?: string };

export async function createChecklistTemplate(
  _prevState: ChecklistTemplateFormState,
  formData: FormData,
): Promise<ChecklistTemplateFormState> {
  const visaType = String(formData.get("visa_type") ?? "").trim();
  const docTypesRaw = String(formData.get("required_doc_types") ?? "");
  const requiredDocTypes = docTypesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!visaType) {
    return { error: "Visa type is required." };
  }
  if (requiredDocTypes.length === 0) {
    return { error: "List at least one required document." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("document_checklist_templates").insert({
    visa_type: visaType,
    required_doc_types: requiredDocTypes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/templates");
  revalidatePath("/visa");
  return {};
}

export async function deleteChecklistTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("document_checklist_templates").delete().eq("id", templateId);
  revalidatePath("/templates");
  revalidatePath("/visa");
}
