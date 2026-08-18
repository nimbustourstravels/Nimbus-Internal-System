"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IntakeFormState = { error?: string };

export async function logIntakeEmail(
  _prevState: IntakeFormState,
  formData: FormData,
): Promise<IntakeFormState> {
  const fromAddress = String(formData.get("from_address") ?? "").trim();
  const rawContent = String(formData.get("raw_content") ?? "").trim() || null;

  if (!fromAddress) {
    return { error: "Sender email is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("intake_emails").insert({
    from_address: fromAddress,
    raw_content: rawContent,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/intake");
  return {};
}

export async function assignIntakeEmail(intakeId: string, clientId: string) {
  if (!clientId) return;

  const supabase = await createClient();
  await supabase
    .from("intake_emails")
    .update({ matched_client_id: clientId, status: "confirmed" })
    .eq("id", intakeId);

  revalidatePath("/intake");
}
