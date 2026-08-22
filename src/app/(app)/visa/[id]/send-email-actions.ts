"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";

export async function sendTemplateEmail(
  caseId: string,
  clientId: string,
  templateId: string | null,
  subject: string,
  body: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const [{ data: employee }, { data: client }] = await Promise.all([
    supabase.from("employees").select("email").eq("id", user.id).single(),
    supabase.from("clients").select("email").eq("id", clientId).single(),
  ]);

  if (!employee?.email) return { error: "Couldn't find your employee email." };
  if (!client?.email) return { error: "This client has no email address on file." };

  const { error } = await sendEmail({
    from: employee.email,
    to: client.email,
    subject,
    text: body,
  });

  if (error) return { error };

  await supabase.from("sent_emails").insert({
    client_id: clientId,
    template_id: templateId,
    sent_by: user.id,
  });

  revalidatePath(`/visa/${caseId}`);
  return { success: true };
}
