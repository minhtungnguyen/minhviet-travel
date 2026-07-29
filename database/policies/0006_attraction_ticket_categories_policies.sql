-- 0006_attraction_ticket_categories_policies.sql
-- Purpose: RLS for database/migrations/0018_attraction_ticket_categories.sql.
-- Same posture as 0004_attraction_ticket_policies.sql's public-content
-- group, simplified because this taxonomy has no status/lifecycle column
-- to gate on (it's static, editorially-managed reference data, not
-- content with a publish workflow).

alter table attraction_categories enable row level security;
alter table attraction_category_translations enable row level security;
alter table attraction_product_categories enable row level security;

create policy "public_read_attraction_categories" on attraction_categories
  for select to anon, authenticated using (true);
create policy "staff_write_attraction_categories" on attraction_categories
  for all to authenticated
  using (auth_has_permission('attraction_ticket.category.write'))
  with check (auth_has_permission('attraction_ticket.category.write'));

create policy "public_read_attraction_category_translations" on attraction_category_translations
  for select to anon, authenticated using (true);
create policy "staff_write_attraction_category_translations" on attraction_category_translations
  for all to authenticated
  using (auth_has_permission('attraction_ticket.category.write'))
  with check (auth_has_permission('attraction_ticket.category.write'));

create policy "public_read_attraction_product_categories" on attraction_product_categories
  for select to anon, authenticated using (true);
create policy "staff_write_attraction_product_categories" on attraction_product_categories
  for all to authenticated
  using (auth_has_permission('attraction_ticket.category.write'))
  with check (auth_has_permission('attraction_ticket.category.write'));
