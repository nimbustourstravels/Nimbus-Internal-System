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

  let attachments: { filename: string; content: string }[] | undefined;

  if (templateId) {
    const { data: template } = await supabase
      .from("email_templates")
      .select("attachment_paths")
      .eq("id", templateId)
      .single();

    const paths = template?.attachment_paths ?? [];
    if (paths.length > 0) {
      const downloaded = await Promise.all(
        paths.map(async (path: string) => {
          const { data, error: downloadError } = await supabase.storage
            .from("client-documents")
            .download(path);
          if (downloadError || !data) return null;
          const buffer = Buffer.from(await data.arrayBuffer());
          return { filename: path.split("/").pop() ?? "attachment.pdf", content: buffer.toString("base64") };
        }),
      );
      attachments = downloaded.filter((a): a is NonNullable<typeof a> => a !== null);
    }
  }

  const { error } = await sendEmail({
    from: employee.email,
    to: client.email,
    subject,
    text: body,
    attachments,
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
