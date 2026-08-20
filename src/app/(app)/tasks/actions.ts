"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TaskFormState = { error?: string };

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const assignedTo = String(formData.get("assigned_to") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim() || null;

  if (!assignedTo) {
    return { error: "Choose who this is assigned to." };
  }
  if (!description) {
    return { error: "Description is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("tasks").insert({
    assigned_to: assignedTo,
    assigned_by: user?.id,
    client_id: clientId,
    description,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return {};
}

export async function setTaskStatus(taskId: string, status: "open" | "in_progress" | "done") {
  const supabase = await createClient();
  await supabase.from("tasks").update({ status }).eq("id", taskId);
  revalidatePath("/tasks");
}

export async function escalateTask(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ escalated: true }).eq("id", taskId);
  revalidatePath("/tasks");
}
