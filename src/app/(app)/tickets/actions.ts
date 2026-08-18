"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TicketFormState = { error?: string };

function readTicketForm(formData: FormData) {
  return {
    client_id: String(formData.get("client_id") ?? "").trim(),
    booking_ref: String(formData.get("booking_ref") ?? "").trim() || null,
    flight_info: String(formData.get("flight_info") ?? "").trim() || null,
    status: String(formData.get("status") ?? "open").trim(),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createTicket(
  _prevState: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const values = readTicketForm(formData);

  if (!values.client_id) {
    return { error: "Choose a client." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("tickets").insert(values).select("id").single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tickets");
  redirect(`/tickets/${data.id}`);
}

export async function updateTicket(
  ticketId: string,
  _prevState: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const values = readTicketForm(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("tickets")
    .update({
      booking_ref: values.booking_ref,
      flight_info: values.flight_info,
      status: values.status,
      notes: values.notes,
    })
    .eq("id", ticketId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  return {};
}
