import { ScanAndCreate } from "./scan-and-create";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">New Client</h1>
      <div className="mt-4">
        <ScanAndCreate />
      </div>
    </div>
  );
}
