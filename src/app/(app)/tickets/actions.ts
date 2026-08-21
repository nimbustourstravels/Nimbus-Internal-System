"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TicketFormState = { error?: string };

function readTicketForm(formData: FormData) {
  return {
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
  const clientIds = formData.getAll("client_ids").map(String).filter(Boolean);

  if (clientIds.length === 0) {
    return { error: "Choose at least one passenger." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("tickets").insert(values).select("id").single();

  if (error) {
    return { error: error.message };
  }

  const { error: linkError } = await supabase
    .from("ticket_clients")
    .insert(clientIds.map((clientId) => ({ ticket_id: data.id, client_id: clientId })));

  if (linkError) {
    return { error: linkError.message };
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

export async function addPassenger(ticketId: string, clientId: string) {
  if (!clientId) return;
  const supabase = await createClient();
  await supabase.from("ticket_clients").insert({ ticket_id: ticketId, client_id: clientId });
  revalidatePath(`/tickets/${ticketId}`);
}

export async function removePassenger(ticketId: string, clientId: string) {
  const supabase = await createClient();
  await supabase
    .from("ticket_clients")
    .delete()
    .eq("ticket_id", ticketId)
    .eq("client_id", clientId);
  revalidatePath(`/tickets/${ticketId}`);
}
