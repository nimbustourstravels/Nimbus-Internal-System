import { createClient } from "@/lib/supabase/server";
import { NewChecklistTemplateForm } from "./new-checklist-template-form";
import { DeleteTemplateButton } from "./delete-template-button";
import { deleteChecklistTemplate } from "./checklist-actions";

export async function ChecklistTemplatesView() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("document_checklist_templates")
    .select("id, visa_type, required_doc_types")
    .order("visa_type");

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">New Document Checklist</h2>
        <p className="mt-1 text-xs text-neutral-500">
          The visa type here must match what&apos;s typed on a visa case exactly for the
          checklist to show up there.
        </p>
        <div className="mt-2">
          <NewChecklistTemplateForm />
        </div>
      </div>

      <ul className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {templates?.map((t) => (
          <li key={t.id} className="px-4 py-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-900">{t.visa_type}</p>
                <ul className="mt-1 list-inside list-disc text-neutral-600">
                  {t.required_doc_types.map((doc: string) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
              <DeleteTemplateButton id={t.id} action={deleteChecklistTemplate} />
            </div>
          </li>
        ))}
        {templates && templates.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">
            No document checklists yet.
          </li>
        )}
      </ul>
    </div>
  );
}
