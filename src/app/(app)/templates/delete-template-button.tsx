"use client";

export function DeleteTemplateButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<void>;
}) {
  return (
    <button
      onClick={() => action(id)}
      className="shrink-0 text-xs text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
