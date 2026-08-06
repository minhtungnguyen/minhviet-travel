-- 0012_ai_import_policies.sql
-- Purpose: RLS for database/migrations/0024_ai_import.sql. Unlike Tour's
-- category/destination/departure tables, import_jobs/import_drafts are
-- purely an internal staff tool (source docs, AI-extracted drafts before
-- review) — no public read at all. Gated on the EXISTING
-- cms.page.create permission (same one Tour Core's own create action
-- requires), no new permission key, same RBAC discipline as
-- 0011_tour_policies.sql.

alter table import_jobs enable row level security;
alter table import_drafts enable row level security;

create policy "staff_read_import_jobs" on import_jobs
  for select to authenticated
  using (auth_has_permission('cms.page.create'));
create policy "staff_write_import_jobs" on import_jobs
  for all to authenticated
  using (auth_has_permission('cms.page.create'))
  with check (auth_has_permission('cms.page.create'));

create policy "staff_read_import_drafts" on import_drafts
  for select to authenticated
  using (auth_has_permission('cms.page.create'));
create policy "staff_write_import_drafts" on import_drafts
  for all to authenticated
  using (auth_has_permission('cms.page.create'))
  with check (auth_has_permission('cms.page.create'));
