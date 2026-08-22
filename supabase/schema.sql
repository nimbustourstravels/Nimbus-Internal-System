-- Nimbus Internal System — Phase 1 schema
-- Run this in the Supabase SQL editor for your project.

create type employee_role as enum ('employee', 'admin');
create type visa_case_status as enum ('not_started', 'documents_incomplete', 'submitted', 'approved', 'rejected');
create type ticket_status as enum ('open', 'booked', 'checked_in', 'completed');
create type task_status as enum ('open', 'in_progress', 'done');
create type intake_status as enum ('unmatched', 'confirmed');

create table employees (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role employee_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table client_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nationality text,
  dob date,
  email text,
  phone text,
  address text,
  passport_number text,
  passport_expiry date,
  father_name text,
  mother_name text,
  spouse_name text,
  group_id uuid references client_groups (id) on delete set null,
  flagged_for_followup boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table document_checklist_templates (
  id uuid primary key default gen_random_uuid(),
  visa_type text not null,
  required_doc_types text[] not null default '{}'
);

create table client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  storage_path text not null,
  doc_type text,
  uploaded_by uuid references employees (id),
  uploaded_at timestamptz not null default now()
);

create table visa_cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  visa_type text not null,
  status visa_case_status not null default 'not_started',
  submission_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  booking_ref text,
  flight_info text,
  status ticket_status not null default 'open',
  notes text,
  created_at timestamptz not null default now()
);

-- One PNR / ticket often covers multiple passengers (a family travelling
-- together), so tickets link to clients through this join table rather
-- than a single client_id.
create table ticket_clients (
  ticket_id uuid not null references tickets (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  primary key (ticket_id, client_id)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  assigned_to uuid references employees (id),
  assigned_by uuid references employees (id),
  client_id uuid references clients (id) on delete set null,
  description text not null,
  status task_status not null default 'open',
  due_date date,
  escalated boolean not null default false,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references employees (id),
  recipient_id uuid references employees (id),
  channel_id uuid,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null,
  visa_type_scope text,
  attachment_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table sent_emails (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  template_id uuid references email_templates (id),
  sent_by uuid references employees (id),
  sent_at timestamptz not null default now()
);

create table intake_emails (
  id uuid primary key default gen_random_uuid(),
  from_address text not null,
  matched_client_id uuid references clients (id),
  status intake_status not null default 'unmatched',
  raw_content text,
  received_at timestamptz not null default now()
);

-- Row-level security: any authenticated employee can read/write day-to-day
-- records; only admins manage employees and templates. Tightened per-module
-- as the UI defines finer-grained needs.

alter table employees enable row level security;
alter table client_groups enable row level security;
alter table clients enable row level security;
alter table ticket_clients enable row level security;
alter table document_checklist_templates enable row level security;
alter table client_documents enable row level security;
alter table visa_cases enable row level security;
alter table tickets enable row level security;
alter table tasks enable row level security;
alter table messages enable row level security;
alter table email_templates enable row level security;
alter table sent_emails enable row level security;
alter table intake_emails enable row level security;

create function is_admin() returns boolean as $$
  select exists (
    select 1 from employees where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create policy "employees read all" on employees for select to authenticated using (true);
create policy "admins manage employees" on employees for all to authenticated using (is_admin()) with check (is_admin());

create policy "employees full access client groups" on client_groups for all to authenticated using (true) with check (true);
create policy "employees full access clients" on clients for all to authenticated using (true) with check (true);
create policy "employees full access ticket clients" on ticket_clients for all to authenticated using (true) with check (true);
create policy "employees full access checklist templates" on document_checklist_templates for all to authenticated using (true) with check (true);
create policy "employees full access client documents" on client_documents for all to authenticated using (true) with check (true);
create policy "employees full access visa cases" on visa_cases for all to authenticated using (true) with check (true);
create policy "employees full access tickets" on tickets for all to authenticated using (true) with check (true);
create policy "employees full access tasks" on tasks for all to authenticated using (true) with check (true);
create policy "employees full access email templates" on email_templates for all to authenticated using (true) with check (true);
create policy "employees full access sent emails" on sent_emails for all to authenticated using (true) with check (true);
create policy "employees full access intake emails" on intake_emails for all to authenticated using (true) with check (true);

create policy "read own or sent messages" on messages for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or channel_id is not null);
create policy "send messages as self" on messages for insert to authenticated
  with check (sender_id = auth.uid());

-- Document storage bucket for client_documents.storage_path
insert into storage.buckets (id, name, public) values ('client-documents', 'client-documents', false)
  on conflict (id) do nothing;

create policy "employees read client documents bucket" on storage.objects for select to authenticated
  using (bucket_id = 'client-documents');
create policy "employees upload client documents bucket" on storage.objects for insert to authenticated
  with check (bucket_id = 'client-documents');
