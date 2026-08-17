# Nimbus Internal System — Phase 1 (Core System)

## Context

Nimbus Tours & Travels needs an internal system to replace ad hoc processes for client/visa/ticket tracking, document handling, and team communication. A design mockup already exists at https://nimbustours-internal.netlify.app/ (v6) with nav: Dashboard, Client Management, Visa, Tickets, Document Intake, Tasks & Messages, Email & Doc Templates, Team — including Employee/Admin views. The target repo (`nimbustourstravels/Nimbus-Internal-System`, cloned fresh to `/Users/shivika/Desktop/Nimbus-Internal-System`) is currently empty, so this is a greenfield build following that mockup's spec.

Scope decisions already made with the user:
- **Phase 1 = everything except real check-in automation.** The agency has GDS access (Amadeus/Sabre/Travelport-class), so real flight check-in/booking automation will be built later against that GDS's official agent API — not by scripting airline/government consumer websites (those explicitly block bot automation, and CAPTCHA-bypass is off the table regardless of intent).
- **Auto-send emails** = employee-triggered, template-prefilled, one-click send — not fully unattended sending. Keeps a human in the loop before anything reaches a client.
- **Document Intake** (inbound client email → auto-matched to client record) will use the **Gmail API**, since the agency's business inbox is Google Workspace.
- No existing tech constraints — stack chosen fresh below.

## Architecture

- **Frontend:** Next.js (App Router, TypeScript, Tailwind) — deployed on Netlify (matches existing hosting/repo).
- **Backend:** Supabase — Postgres (data), Auth (employee logins + role), Storage (client documents), Realtime (messaging/task updates). One vendor instead of stitching together separate DB/auth/storage/pubsub services.
- **Outbound email:** Resend, triggered from a Next.js server action/API route when an employee clicks "send" on a template.
- **Inbound email (Document Intake):** Gmail API (domain-wide delegation or a dedicated Google Cloud OAuth app against the business inbox) polling/pushing new mail, matched to clients by sender address, unmatched ones queued for manual assignment.
- **Row-level security:** Supabase RLS policies gate data by employee role (`employee` vs `admin`), since this holds passport numbers, DOB, and other sensitive PII — least-privilege by default even though it's an internal tool.

## Data model (Postgres, via Supabase)

- `employees` — id, name, email, role (`employee`|`admin`), linked to Supabase Auth user
- `clients` — id, full_name, nationality, dob, email, phone, address, passport_number, passport_expiry, flagged_for_followup, notes, created_at
- `client_documents` — id, client_id, storage_path, doc_type, uploaded_by, uploaded_at
- `document_checklist_templates` — visa_type, required_doc_types[] (drives "what's still required" per case)
- `visa_cases` — id, client_id, visa_type, status (`not_started`|`documents_incomplete`|`submitted`|`approved`|`rejected`), submission_date, notes
- `tickets` — id, client_id, booking_ref, flight_info, status (`open`|`booked`|`checked_in`|`completed`), notes — metadata only in Phase 1
- `tasks` — id, assigned_to, assigned_by, client_id (nullable), description, status, due_date, escalated (bool)
- `messages` — id, sender_id, recipient_id (or channel_id for group threads), body, created_at, read_at
- `email_templates` — id, name, subject, body (supports `{{client_name}}`-style variables), visa_type_scope
- `sent_emails` — id, client_id, template_id, sent_by, sent_at (audit trail)
- `intake_emails` — id, from_address, matched_client_id (nullable), status (`unmatched`|`confirmed`), raw_content, received_at

## Build order (each step ships a working slice)

1. **Foundation** — Next.js scaffold in the Nimbus-Internal-System repo, Supabase project + schema above, employee Auth + role-based layout, base nav matching the mockup, Netlify deploy wired to `origin`.
2. **Client Management** — client CRUD, profile page, document upload/list via Supabase Storage.
3. **Visa Cases** — case CRUD linked to a client, checklist-driven "documents still required" view, status filters.
4. **Tickets** — ticket CRUD linked to a client (booking metadata; no automation yet).
5. **Tasks & Messages** — task assignment/escalation, employee-to-employee messaging via Supabase Realtime.
6. **Email & Templates** — template CRUD with variable substitution, one-click send-to-client, sent-email audit log (Resend).
7. **Document Intake** — Gmail API integration, sender-to-client matching, manual-assign queue for unmatched senders.
8. **Team Dashboard** — per-employee workload rollup (pending/completed/overdue), admin-only.

Deferred to Phase 2 (explicitly out of scope here): real flight check-in/booking automation via the agency's GDS agent API.

## Verification

- After step 1: confirm employee login works and role-gated nav renders; deploy succeeds on Netlify from the connected repo.
- After each subsequent step: exercise the CRUD/flow in the browser against a test client record end-to-end (create → edit → verify persisted in Supabase table).
- After step 6: send a real test template email to a personal address via Resend and confirm variable substitution and audit log entry.
- After step 7: send a test email from an external address to the business inbox and confirm it appears in the intake queue (matched or unmatched as expected).
