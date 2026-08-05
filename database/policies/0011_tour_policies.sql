-- 0011_tour_policies.sql
-- Purpose: RLS for database/migrations/0023_tour_cms.sql. Same posture as
-- 0008_news_categories_policies.sql: public read (the public /tour pages
-- need to resolve category/destination/departure data for a tour), staff
-- write gated on the EXISTING cms.page.update / cms.page.publish
-- permissions — no new permission created, same RBAC discipline as News
-- categories (docs/backend/admin-os/05-rbac-gap-report.md).
--
-- Publish-status filtering (only show departures/categories for a
-- PUBLISHED tour) happens at the application query layer, not here —
-- same as news_article_categories' unconditional `using (true)`, which
-- this mirrors deliberately for consistency.

alter table tour_categories enable row level security;
alter table tour_page_categories enable row level security;
alter table tour_page_destinations enable row level security;
alter table tour_departures enable row level security;

create policy "public_read_active_tour_categories" on tour_categories
  for select to anon, authenticated using (is_active = true);
create policy "staff_write_tour_categories" on tour_categories
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "public_read_tour_page_categories" on tour_page_categories
  for select to anon, authenticated using (true);
create policy "staff_write_tour_page_categories" on tour_page_categories
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "public_read_tour_page_destinations" on tour_page_destinations
  for select to anon, authenticated using (true);
create policy "staff_write_tour_page_destinations" on tour_page_destinations
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "public_read_tour_departures" on tour_departures
  for select to anon, authenticated using (true);
-- Departure/pricing edits are a publish-adjacent operation (changes what's
-- bookable) — gated on cms.page.publish, one level stricter than the
-- generic cms.page.update used for categories/destinations/itinerary text.
create policy "staff_write_tour_departures" on tour_departures
  for all to authenticated
  using (auth_has_permission('cms.page.publish'))
  with check (auth_has_permission('cms.page.publish'));
