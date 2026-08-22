-- Run this in the Supabase SQL editor.
-- Lets an email template carry one or more file attachments (e.g. the
-- actual visa requirement PDFs) that go out with the email automatically.

alter table email_templates add column if not exists attachment_paths text[] not null default '{}';
