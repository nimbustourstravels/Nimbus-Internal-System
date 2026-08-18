import { createClient } from "@/lib/supabase/server";
import { NewVisaCaseForm } from "./new-visa-case-form";

export default async function NewVisaCasePage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .order("full_name");

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">New Visa Case</h1>
      <div className="mt-4">
        <NewVisaCaseForm clients={clients ?? []} defaultClientId={client_id} />
      </div>
    </div>
  );
}
