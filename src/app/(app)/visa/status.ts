export const VISA_STATUSES = [
  "not_started",
  "documents_incomplete",
  "submitted",
  "approved",
  "rejected",
] as const;

export type VisaStatus = (typeof VISA_STATUSES)[number];

export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  not_started: "Not Started",
  documents_incomplete: "Documents Incomplete",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export const VISA_STATUS_COLORS: Record<VisaStatus, string> = {
  not_started: "bg-neutral-100 text-neutral-700",
  documents_incomplete: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
