import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "../client-form";
import { updateClientRecord } from "../actions";
import { DocumentsSection } from "./documents-section";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();

  if (!client) {
    notFound();
  }

  const { data: documents } = await supabase
    .from("client_documents")
    .select("id, storage_path, doc_type, uploaded_at")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const [{ data: signed }, { data: signedDownload }] = await Promise.all([
        supabase.storage.from("client-documents").createSignedUrl(doc.storage_path, 60 * 10),
        supabase.storage
          .from("client-documents")
          .createSignedUrl(doc.storage_path, 60 * 10, { download: true }),
      ]);
      return {
        ...doc,
        url: signed?.signedUrl ?? null,
        downloadUrl: signedDownload?.signedUrl ?? null,
      };
    }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{client.full_name}</h1>
        <p className="text-sm text-neutral-500">Client profile</p>
      </div>

      <ClientForm
        key={JSON.stringify(client)}
        action={updateClientRecord.bind(null, client.id)}
        initial={client}
        submitLabel="Save changes"
      />

      <DocumentsSection clientId={client.id} documents={documentsWithUrls} />
    </div>
  );
}
