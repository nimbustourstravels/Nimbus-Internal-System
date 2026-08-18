"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type VisaFormState = { error?: string };

function readVisaForm(formData: FormData) {
  return {
    client_id: String(formData.get("client_id") ?? "").trim(),
    visa_type: String(formData.get("visa_type") ?? "").trim(),
    status: String(formData.get("status") ?? "not_started").trim(),
    submission_date: String(formData.get("submission_date") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createVisaCase(
  _prevState: VisaFormState,
  formData: FormData,
): Promise<VisaFormState> {
  const values = readVisaForm(formData);

  if (!values.client_id) {
    return { error: "Choose a client." };
  }
  if (!values.visa_type) {
    return { error: "Visa type is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visa_cases")
    .insert(values)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/visa");
  redirect(`/visa/${data.id}`);
}

export async function updateVisaCase(
  caseId: string,
  _prevState: VisaFormState,
  formData: FormData,
): Promise<VisaFormState> {
  const values = readVisaForm(formData);

  if (!values.visa_type) {
    return { error: "Visa type is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("visa_cases")
    .update({
      visa_type: values.visa_type,
      status: values.status,
      submission_date: values.submission_date,
      notes: values.notes,
    })
    .eq("id", caseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/visa/${caseId}`);
  revalidatePath("/visa");
  return {};
}
