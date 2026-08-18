import Link from "next/link";
import { EmailTemplatesView } from "./email-templates-view";
import { ChecklistTemplatesView } from "./checklist-templates-view";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView = view === "checklists" ? "checklists" : "email";

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Email &amp; Doc Templates</h1>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/templates"
          className={`rounded px-2 py-1 ${activeView === "email" ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          Email Templates
        </Link>
        <Link
          href="/templates?view=checklists"
          className={`rounded px-2 py-1 ${activeView === "checklists" ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          Document Checklists
        </Link>
      </div>

      <div className="mt-4">
        {activeView === "email" ? <EmailTemplatesView /> : <ChecklistTemplatesView />}
      </div>
    </div>
  );
}
