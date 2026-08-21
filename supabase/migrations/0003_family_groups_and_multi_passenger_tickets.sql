-- Run this in the Supabase SQL editor.
-- Adds family/group tagging on clients, and lets one ticket cover multiple
-- passengers (a PNR is normally booked for a whole family, not one person).

create table client_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table clients add column group_id uuid references client_groups(id) on delete set null;

create table ticket_clients (
  ticket_id uuid not null references tickets(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  primary key (ticket_id, client_id)
);

-- Carry over any existing single-passenger tickets into the new join table.
insert into ticket_clients (ticket_id, client_id)
  select id, client_id from tickets where client_id is not null;

alter table tickets drop column client_id;

alter table client_groups enable row level security;
alter table ticket_clients enable row level security;

create policy "employees full access client groups" on client_groups
  for all to authenticated using (true) with check (true);
create policy "employees full access ticket clients" on ticket_clients
  for all to authenticated using (true) with check (true);
