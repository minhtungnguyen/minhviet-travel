-- 0008_news_categories_policies.sql
-- Purpose: RLS for database/migrations/0021_news_categories.sql.
-- Same posture as 0002_public_content_policies.sql's cms_block_definitions
-- policy: public read of active rows only (the public /tin-tuc pages need
-- to resolve a category name for an article), staff write gated on an
-- EXISTING permission (cms.page.update — News categories are CMS content
-- structure, no new permission created per the RBAC discipline established
-- in docs/backend/admin-os/05-rbac-gap-report.md).

alter table news_categories enable row level security;
alter table news_article_categories enable row level security;

create policy "public_read_active_news_categories" on news_categories
  for select to anon, authenticated using (is_active = true);
create policy "staff_write_news_categories" on news_categories
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "public_read_news_article_categories" on news_article_categories
  for select to anon, authenticated using (true);
create policy "staff_write_news_article_categories" on news_article_categories
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));
