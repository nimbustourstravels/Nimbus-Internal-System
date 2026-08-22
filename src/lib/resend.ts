export async function sendEmail({
  from,
  to,
  subject,
  text,
  attachments,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[];
}): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: "Email sending isn't set up yet — Resend hasn't been configured." };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, attachments }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.message ?? `Resend request failed (${res.status})` };
  }

  return {};
}
