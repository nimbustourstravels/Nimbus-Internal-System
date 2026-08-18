export const TICKET_STATUSES = ["open", "booked", "checked_in", "completed"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  booked: "Booked",
  checked_in: "Checked In",
  completed: "Completed",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-neutral-100 text-neutral-700",
  booked: "bg-blue-100 text-blue-800",
  checked_in: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
};
