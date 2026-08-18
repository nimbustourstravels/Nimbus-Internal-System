"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EmailTemplateFormState = { error?: string };

export async function createEmailTemplate(
  _prevState: EmailTemplateFormState,
  formData: FormData,
): Promise<EmailTemplateFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const visaTypeScope = String(formData.get("visa_type_scope") ?? "").trim() || null;

  if (!name || !subject || !body) {
    return { error: "Name, subject, and body are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("email_templates").insert({
    name,
    subject,
    body,
    visa_type_scope: visaTypeScope,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/templates");
  return {};
}

export async function deleteEmailTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("email_templates").delete().eq("id", templateId);
  revalidatePath("/templates");
}
