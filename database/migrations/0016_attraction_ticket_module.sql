-- 0016_attraction_ticket_module.sql
-- Purpose: Attraction Ticket module ("Vé vui chơi", docs/mv-ticket/03-database-design.md).
-- First real Booking/Order domain in this schema — no prior art to extend,
-- see docs/mv-ticket/00-current-state-audit.md §2.
--
-- Numbering note: the live `mv-travel-os-dev` project already has two
-- hardening migrations applied directly (referred to as "0014"/"0015" in
-- docs/backend/sprint-1b1-database-deployment-report.md §5) that were never
-- checked into database/migrations/ as files — a pre-existing gap in this
-- repo, not introduced here. This file is deliberately numbered 0016 (not
-- 0014) to avoid any collision with those already-applied, unfiled changes.
--
-- Design decisions (full rationale in docs/mv-ticket/03-database-design.md):
--   - `attraction_venues` references `destinations(id)` for geography
--     instead of duplicating the location hierarchy (destinations already
--     has destination_type = 'ATTRACTION' as a leaf node).
--   - `attraction_products.product_type_id` references `product_types(id)`
--     (already seeded with ATTRACTION_TICKET) — cross-module FK, same
--     precedent as `destinations.media_asset_id -> media_assets(id)` added
--     in 0008_media.sql. Application code still never queries another
--     module's table directly from its own repository (module-boundaries.md)
--     — only the SQL FK constraint crosses the module line, not query code.
--   - No `Availability`/`Customer` tables in V1 — availability is always
--     fetched live from the provider (brief §VII: "không import toàn bộ dữ
--     liệu động định kỳ"), and V1 is guest checkout (contact fields live
--     directly on attraction_orders).

create type attraction_order_status as enum (
  'INITIATED', 'PENDING_PAYMENT', 'CONFIRMED', 'FAILED', 'CANCELLED', 'VOUCHER_ISSUED'
);
comment on type attraction_order_status is
  'Booking lifecycle for the Attraction Ticket module. INITIATED = created locally before the provider order call; PENDING_PAYMENT = provider order created, awaiting payment confirmation; CONFIRMED = payment confirmed; VOUCHER_ISSUED = voucher retrieved and available; FAILED/CANCELLED are terminal.';

-- attraction_venues ---------------------------------------------------------
create table attraction_venues (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  destination_id uuid not null references destinations(id),
  slug text not null,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger set_updated_at before update on attraction_venues
  for each row execute function set_updated_at();
create index attraction_venues_website_id_idx on attraction_venues(website_id);
create index attraction_venues_destination_id_idx on attraction_venues(destination_id);
-- Function-based uniqueness needs an index, not an inline UNIQUE table
-- constraint (Postgres doesn't accept an expression there) — same pattern
-- as destination_translations_locale_slug_idx in 0007_master_data_extended.sql.
create unique index attraction_venues_website_slug_idx on attraction_venues(website_id, lower(slug));

create table attraction_venue_translations (
  id uuid primary key default gen_random_uuid(),
  attraction_venue_id uuid not null references attraction_venues(id) on delete cascade,
  locale text not null references languages(code),
  name text not null,
  summary text,
  description text,
  usage_guide text,
  policy text,
  highlights jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attraction_venue_id, locale)
);
create trigger set_updated_at before update on attraction_venue_translations
  for each row execute function set_updated_at();

-- attraction_products (TicketProduct) ---------------------------------------
create table attraction_products (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  attraction_venue_id uuid not null references attraction_venues(id),
  product_type_id uuid not null references product_types(id),
  slug text not null,
  price_from numeric(12, 0),
  currency text not null default 'VND',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (currency = 'VND') -- V1 is VND-only by design (brief §I.14 "không Multi-currency")
);
create trigger set_updated_at before update on attraction_products
  for each row execute function set_updated_at();
create index attraction_products_website_id_idx on attraction_products(website_id);
create index attraction_products_venue_id_idx on attraction_products(attraction_venue_id);
create unique index attraction_products_website_slug_idx on attraction_products(website_id, lower(slug));

create table attraction_product_translations (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  locale text not null references languages(code),
  title text not null,
  summary text,
  description text,
  cancellation_policy text,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attraction_product_id, locale)
);
create trigger set_updated_at before update on attraction_product_translations
  for each row execute function set_updated_at();

-- attraction_provider_refs (Provider Reference — "Dữ liệu B") ---------------
create table attraction_provider_refs (
  id uuid primary key default gen_random_uuid(),
  attraction_venue_id uuid references attraction_venues(id) on delete cascade,
  attraction_product_id uuid references attraction_products(id) on delete cascade,
  provider_code text not null default 'ONEINVENTORY',
  provider_venue_id text,
  provider_product_id text,
  provider_variant_id text,
  last_synced_at timestamptz,
  raw_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(attraction_venue_id, attraction_product_id) = 1)
);
create trigger set_updated_at before update on attraction_provider_refs
  for each row execute function set_updated_at();
create index attraction_provider_refs_venue_id_idx on attraction_provider_refs(attraction_venue_id);
create index attraction_provider_refs_product_id_idx on attraction_provider_refs(attraction_product_id);
comment on column attraction_provider_refs.raw_snapshot is
  'Provider response after schema validation, for debugging only — must never contain API keys/secrets (docs/security/secret-management.md).';

-- attraction_faqs / attraction_cross_sells ----------------------------------
create table attraction_faqs (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  locale text not null references languages(code),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index attraction_faqs_product_id_idx on attraction_faqs(attraction_product_id);

create table attraction_cross_sells (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  related_url text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index attraction_cross_sells_product_id_idx on attraction_cross_sells(attraction_product_id);

-- attraction_orders (Booking) ------------------------------------------------
create table attraction_orders (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  order_code text not null,
  idempotency_key uuid not null,
  provider_code text not null default 'ONEINVENTORY',
  provider_order_id text,
  status attraction_order_status not null default 'INITIATED',
  payment_status text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  note text,
  currency text not null default 'VND',
  total_amount numeric(12, 0) not null check (total_amount >= 0),
  request_snapshot jsonb,
  response_reference jsonb,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, order_code),
  unique (idempotency_key)
);
create trigger set_updated_at before update on attraction_orders
  for each row execute function set_updated_at();
create index attraction_orders_website_id_idx on attraction_orders(website_id);
create index attraction_orders_status_idx on attraction_orders(status);
comment on column attraction_orders.request_snapshot is
  'Payload sent to the provider, with sensitive fields (payment/card data, secrets) stripped before storage — never the raw provider request as-is.';

create table attraction_order_items (
  id uuid primary key default gen_random_uuid(),
  attraction_order_id uuid not null references attraction_orders(id) on delete cascade,
  attraction_product_id uuid not null references attraction_products(id),
  provider_variant_id text not null,
  usage_date date not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 0) not null check (unit_price >= 0),
  ticket_holder_name text,
  created_at timestamptz not null default now()
);
create index attraction_order_items_order_id_idx on attraction_order_items(attraction_order_id);

create table attraction_vouchers (
  id uuid primary key default gen_random_uuid(),
  attraction_order_id uuid not null references attraction_orders(id) on delete cascade,
  provider_voucher_id text not null,
  download_url text,
  hash_code text,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  unique (attraction_order_id, provider_voucher_id)
);
create index attraction_vouchers_order_id_idx on attraction_vouchers(attraction_order_id);

-- attraction_sync_logs / attraction_api_error_logs --------------------------
create table attraction_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null, -- 'VENUE' | 'PRODUCT' | 'AVAILABILITY' | 'MANUAL'
  status text not null,    -- 'SUCCESS' | 'FAILED'
  attraction_venue_id uuid references attraction_venues(id),
  attraction_product_id uuid references attraction_products(id),
  error_message text,
  triggered_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);
create index attraction_sync_logs_created_at_idx on attraction_sync_logs(created_at desc);

create table attraction_api_error_logs (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  endpoint text not null,
  http_status integer,
  error_code text,
  error_message text,
  attraction_order_id uuid references attraction_orders(id),
  created_at timestamptz not null default now()
);
create index attraction_api_error_logs_created_at_idx on attraction_api_error_logs(created_at desc);
comment on table attraction_api_error_logs is
  'OneInventory (or future provider) call failures for CMS review (brief §X "API error logs") — never stores request/response bodies containing secrets.';
