import { createClient } from "@/lib/supabase/server";
import { NewEmailTemplateForm } from "./new-email-template-form";
import { DeleteTemplateButton } from "./delete-template-button";
import { deleteEmailTemplate } from "./email-actions";

export async function EmailTemplatesView() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("email_templates")
    .select("id, name, subject, body, visa_type_scope")
    .order("name");

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">New Email Template</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Use variables like <code>{"{{client_name}}"}</code> in the subject or body — they get
          filled in when an employee sends the template to a client.
        </p>
        <div className="mt-2">
          <NewEmailTemplateForm />
        </div>
      </div>

      <ul className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {templates?.map((t) => (
          <li key={t.id} className="px-4 py-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {t.name}
                  {t.visa_type_scope && (
                    <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                      {t.visa_type_scope}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-neutral-500">{t.subject}</p>
                <p className="mt-1 whitespace-pre-wrap text-neutral-600">{t.body}</p>
              </div>
              <DeleteTemplateButton id={t.id} action={deleteEmailTemplate} />
            </div>
          </li>
        ))}
        {templates && templates.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">
            No email templates yet.
          </li>
        )}
      </ul>
    </div>
  );
}
