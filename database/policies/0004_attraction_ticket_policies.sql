-- 0004_attraction_ticket_policies.sql
-- Purpose: RLS for database/migrations/0016_attraction_ticket_module.sql.
-- Same posture split as 0002 (public content) / 0003 (internal tables):
-- venues/products/translations/faqs/cross-sells are public-readable when
-- ACTIVE (mirrors "public_read_active_destinations" in 0002); orders,
-- order items, vouchers, sync logs and API error logs are never
-- anon-readable (mirrors form_submissions/audit_logs in 0003 — booking
-- data is read only by staff with an explicit permission, never by
-- unauthenticated identifier-guessing, per brief §VIII.E "không công khai
-- identifier nhạy cảm trong URL").

-- attraction_venues / attraction_venue_translations -------------------------
alter table attraction_venues enable row level security;
alter table attraction_venue_translations enable row level security;

create policy "public_read_active_attraction_venues" on attraction_venues
  for select to anon, authenticated
  using (status = 'ACTIVE' and deleted_at is null);
create policy "staff_read_all_attraction_venues" on attraction_venues
  for select to authenticated using (auth_has_permission('attraction_ticket.venue.write'));
create policy "staff_write_attraction_venues" on attraction_venues
  for all to authenticated
  using (auth_has_permission('attraction_ticket.venue.write'))
  with check (auth_has_permission('attraction_ticket.venue.write'));

create policy "public_read_attraction_venue_translations" on attraction_venue_translations
  for select to anon, authenticated
  using (exists (
    select 1 from attraction_venues v where v.id = attraction_venue_translations.attraction_venue_id
    and v.status = 'ACTIVE' and v.deleted_at is null
  ));
create policy "staff_write_attraction_venue_translations" on attraction_venue_translations
  for all to authenticated
  using (auth_has_permission('attraction_ticket.venue.write'))
  with check (auth_has_permission('attraction_ticket.venue.write'));

-- attraction_products / attraction_product_translations ---------------------
alter table attraction_products enable row level security;
alter table attraction_product_translations enable row level security;

create policy "public_read_active_attraction_products" on attraction_products
  for select to anon, authenticated
  using (status = 'ACTIVE' and deleted_at is null);
create policy "staff_read_all_attraction_products" on attraction_products
  for select to authenticated using (auth_has_permission('attraction_ticket.product.write'));
create policy "staff_write_attraction_products" on attraction_products
  for all to authenticated
  using (auth_has_permission('attraction_ticket.product.write'))
  with check (auth_has_permission('attraction_ticket.product.write'));

create policy "public_read_attraction_product_translations" on attraction_product_translations
  for select to anon, authenticated
  using (exists (
    select 1 from attraction_products p where p.id = attraction_product_translations.attraction_product_id
    and p.status = 'ACTIVE' and p.deleted_at is null
  ));
create policy "staff_write_attraction_product_translations" on attraction_product_translations
  for all to authenticated
  using (auth_has_permission('attraction_ticket.product.write'))
  with check (auth_has_permission('attraction_ticket.product.write'));

-- attraction_faqs / attraction_cross_sells (follow their parent product) ----
alter table attraction_faqs enable row level security;
alter table attraction_cross_sells enable row level security;

create policy "public_read_attraction_faqs" on attraction_faqs
  for select to anon, authenticated
  using (exists (
    select 1 from attraction_products p where p.id = attraction_faqs.attraction_product_id
    and p.status = 'ACTIVE' and p.deleted_at is null
  ));
create policy "staff_write_attraction_faqs" on attraction_faqs
  for all to authenticated
  using (auth_has_permission('attraction_ticket.content.publish'))
  with check (auth_has_permission('attraction_ticket.content.publish'));

create policy "public_read_attraction_cross_sells" on attraction_cross_sells
  for select to anon, authenticated
  using (exists (
    select 1 from attraction_products p where p.id = attraction_cross_sells.attraction_product_id
    and p.status = 'ACTIVE' and p.deleted_at is null
  ));
create policy "staff_write_attraction_cross_sells" on attraction_cross_sells
  for all to authenticated
  using (auth_has_permission('attraction_ticket.content.publish'))
  with check (auth_has_permission('attraction_ticket.content.publish'));

-- attraction_provider_refs: internal only — provider IDs are not public ----
alter table attraction_provider_refs enable row level security;

create policy "staff_read_attraction_provider_refs" on attraction_provider_refs
  for select to authenticated using (auth_has_permission('attraction_ticket.sync.read'));
create policy "staff_write_attraction_provider_refs" on attraction_provider_refs
  for all to authenticated
  using (auth_has_permission('attraction_ticket.sync.trigger'))
  with check (auth_has_permission('attraction_ticket.sync.trigger'));

-- attraction_orders / attraction_order_items / attraction_vouchers ----------
-- No anon policy anywhere in this group (same posture as form_submissions/
-- audit_logs in 0003_internal_tables_policies.sql). Guest checkout writes
-- go through a server route using the service role after Zod validation +
-- idempotency check, matching the form-submission pattern exactly — never
-- a direct authenticated/anon INSERT policy.
alter table attraction_orders enable row level security;
alter table attraction_order_items enable row level security;
alter table attraction_vouchers enable row level security;

create policy "staff_read_attraction_orders" on attraction_orders
  for select to authenticated using (auth_has_permission('attraction_ticket.booking.read'));
create policy "staff_update_attraction_orders" on attraction_orders
  for update to authenticated
  using (auth_has_permission('attraction_ticket.booking.cancel'))
  with check (auth_has_permission('attraction_ticket.booking.cancel'));

create policy "staff_read_attraction_order_items" on attraction_order_items
  for select to authenticated using (auth_has_permission('attraction_ticket.booking.read'));

create policy "staff_read_attraction_vouchers" on attraction_vouchers
  for select to authenticated using (auth_has_permission('attraction_ticket.booking.read'));

-- attraction_sync_logs / attraction_api_error_logs --------------------------
alter table attraction_sync_logs enable row level security;
alter table attraction_api_error_logs enable row level security;

create policy "staff_read_attraction_sync_logs" on attraction_sync_logs
  for select to authenticated using (auth_has_permission('attraction_ticket.sync.read'));
create policy "staff_read_attraction_api_error_logs" on attraction_api_error_logs
  for select to authenticated using (auth_has_permission('attraction_ticket.sync.read'));
-- No write policy for either table for any authenticated role — both are
-- written exclusively via the service role from server-side application
-- code (same posture as audit_logs), never directly by a client.
