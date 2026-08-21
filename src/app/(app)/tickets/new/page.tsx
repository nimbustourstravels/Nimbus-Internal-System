import { createClient } from "@/lib/supabase/server";
import { NewTicketForm } from "./new-ticket-form";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, client_groups(name)")
    .order("full_name");

  const options = (clients ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    group_name: (c.client_groups as unknown as { name: string } | null)?.name ?? null,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">New Ticket</h1>
      <div className="mt-4">
        <NewTicketForm clients={options} defaultClientId={client_id} />
      </div>
    </div>
  );
}
