import Link from "next/link";
import { TasksView } from "./tasks-view";
import { MessagesView } from "./messages-view";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; with?: string }>;
}) {
  const { view, with: withId } = await searchParams;
  const activeView = view === "messages" ? "messages" : "tasks";

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Tasks &amp; Messages</h1>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/tasks"
          className={`rounded px-2 py-1 ${activeView === "tasks" ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          Tasks
        </Link>
        <Link
          href="/tasks?view=messages"
          className={`rounded px-2 py-1 ${activeView === "messages" ? "bg-neutral-200" : "text-neutral-500 hover:bg-neutral-100"}`}
        >
          Messages
        </Link>
      </div>

      <div className="mt-4">
        {activeView === "tasks" ? <TasksView /> : <MessagesView withId={withId} />}
      </div>
    </div>
  );
}
