import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditVisaCaseForm } from "./edit-visa-case-form";
import { SendEmailSection } from "./send-email-section";
import { VISA_STATUS_LABELS, VISA_STATUS_COLORS, type VisaStatus } from "../status";

export default async function VisaCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: visaCase } = await supabase
    .from("visa_cases")
    .select(
      "id, visa_type, status, submission_date, notes, client_id, clients(id, full_name, email)",
    )
    .eq("id", id)
    .single();

  if (!visaCase) {
    notFound();
  }

  const client = visaCase.clients as unknown as {
    id: string;
    full_name: string;
    email: string | null;
  } | null;

  const [{ data: checklist }, { data: documents }] = await Promise.all([
    supabase
      .from("document_checklist_templates")
      .select("required_doc_types")
      .eq("visa_type", visaCase.visa_type)
      .maybeSingle(),
    supabase
      .from("client_documents")
      .select("doc_type")
      .eq("client_id", visaCase.client_id),
  ]);

  const uploadedTypes = new Set(
    (documents ?? []).map((d) => (d.doc_type ?? "").trim().toLowerCase()),
  );

  const { data: templates } = await supabase
    .from("email_templates")
    .select("id, name, subject, body, attachment_paths")
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-neutral-500">
          {client && (
            <Link href={`/clients/${client.id}`} className="underline">
              {client.full_name}
            </Link>
          )}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-neutral-900">{visaCase.visa_type}</h1>
          <span
            className={`rounded px-2 py-0.5 text-xs ${VISA_STATUS_COLORS[visaCase.status as VisaStatus]}`}
          >
            {VISA_STATUS_LABELS[visaCase.status as VisaStatus]}
          </span>
        </div>
      </div>

      <EditVisaCaseForm
        caseId={visaCase.id}
        initial={{
          visa_type: visaCase.visa_type,
          status: visaCase.status,
          submission_date: visaCase.submission_date,
          notes: visaCase.notes,
        }}
      />

      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Document checklist</h2>
        {!checklist ? (
          <p className="mt-2 text-sm text-neutral-500">
            No document checklist configured for &quot;{visaCase.visa_type}&quot; yet.
          </p>
        ) : (
          <ul className="mt-2 max-w-xl divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
            {checklist.required_doc_types.map((docType: string) => {
              const have = uploadedTypes.has(docType.trim().toLowerCase());
              return (
                <li
                  key={docType}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <span className="text-neutral-900">{docType}</span>
                  <span className={have ? "text-green-700" : "text-amber-700"}>
                    {have ? "Have it" : "Still needed"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {client && (
          <p className="mt-2 text-xs text-neutral-500">
            Manage uploaded documents on{" "}
            <Link href={`/clients/${client.id}`} className="underline">
              {client.full_name}&apos;s profile
            </Link>
            .
          </p>
        )}
      </div>

      {client && (
        <SendEmailSection
          caseId={visaCase.id}
          clientId={client.id}
          clientName={client.full_name}
          clientEmail={client.email}
          visaType={visaCase.visa_type}
          templates={templates ?? []}
        />
      )}
    </div>
  );
}
