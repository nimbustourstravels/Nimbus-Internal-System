-- Run this in the Supabase SQL editor. Adds fields sourced from the Indian
-- passport's last (address) page.

alter table clients add column if not exists father_name text;
alter table clients add column if not exists mother_name text;
alter table clients add column if not exists spouse_name text;
