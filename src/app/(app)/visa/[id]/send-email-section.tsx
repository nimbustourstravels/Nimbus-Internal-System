"use client";

import { useState } from "react";
import { sendTemplateEmail } from "./send-email-actions";

type Template = { id: string; name: string; subject: string; body: string };

function fillTemplate(text: string, clientName: string, visaType: string) {
  return text
    .replaceAll("{{client_name}}", clientName)
    .replaceAll("{{visa_type}}", visaType);
}

export function SendEmailSection({
  caseId,
  clientId,
  clientName,
  clientEmail,
  visaType,
  templates,
}: {
  caseId: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  visaType: string;
  templates: Template[];
}) {
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleTemplateChange(id: string) {
    setTemplateId(id);
    setNotice(null);
    setError(null);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setSubject(fillTemplate(template.subject, clientName, visaType));
    setBody(fillTemplate(template.body, clientName, visaType));
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    setNotice(null);

    const result = await sendTemplateEmail(
      caseId,
      clientId,
      templateId || null,
      subject,
      body,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setNotice(`Sent to ${clientEmail}.`);
    }
    setSending(false);
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900">Send Email</h2>
      {!clientEmail && (
        <p className="mt-1 text-sm text-amber-700">
          This client has no email on file — add one on their profile before sending.
        </p>
      )}

      <div className="mt-2 max-w-xl space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="template">
            Template
          </label>
          <select
            id="template"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Choose a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="body">
            Body
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-neutral-500">
            Auto-filled from the template — edit freely before sending.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <button
          onClick={handleSend}
          disabled={sending || !clientEmail || !subject || !body}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
