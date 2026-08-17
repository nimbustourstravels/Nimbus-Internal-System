import { ClientForm } from "../client-form";
import { createClientRecord } from "../actions";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">New Client</h1>
      <div className="mt-4">
        <ClientForm action={createClientRecord} submitLabel="Create client" />
      </div>
    </div>
  );
}
