-- 0007_public_setting_definitions_read.sql
-- Purpose: Sprint 2 ("Make the CMS usable") wires the public homepage's
-- SEO/organization fields to real setting_values (company.hotline,
-- company.email, company.city). Discovered live: `setting_values` already
-- had an anon-read policy for PUBLIC-visibility settings
-- (0003_internal_tables_policies.sql), but its own `EXISTS` subquery
-- against `setting_definitions` was itself blocked by that table's
-- authenticated-only policy, so the existing anon policy could never
-- actually resolve true. This closes that gap — narrowly scoped to rows
-- where visibility = 'PUBLIC'; INTERNAL/secret definitions stay
-- authenticated-only, unchanged.
create policy public_read_public_setting_definitions on setting_definitions for select to anon
  using (visibility = 'PUBLIC');
