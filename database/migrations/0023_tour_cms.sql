-- 0023_tour_cms.sql
-- Purpose: Sprint 7 Phase 1, Tour CMS schema. Founder decision (Sprint 7
-- Phase 0 GAP Matrix, confirmed): a Tour is a `cms_pages` row (new
-- `page_type = 'TOUR'`, slug prefixed `tour/` the same way News uses
-- `tin-tuc/`) so it gets the entire Draft/Review/Approve/Publish/Schedule
-- workflow, versioning, the Scheduler, and SEO's seo_metadata_id linkage
-- for free — zero new code in any of those systems. Only the genuinely
-- structured/queryable data below gets its own table.
--
-- Itinerary days, the photo gallery, and inclusions/exclusions/cancellation
-- policy are deliberately NOT new tables here — they render fine as
-- `cms_blocks.config` jsonb (a `content`-style section per Tour version),
-- reusing the already-seeded TIMELINE/GALLERY block-definition keys and
-- the existing `media_asset_usage` scan (which greps `cms_blocks.config`
-- for a storage path — see media.repository.ts findAssetUsage), same as
-- News' RICH_TEXT `content` block. Only Phase 3/5's admin forms are new,
-- not schema.
--
-- Additive only. No DROP, no DELETE.

alter type cms_page_type add value 'TOUR';

-- Category taxonomy — mirrors news_categories exactly (database/migrations/
-- 0021_news_categories.sql): real relational table, not JSON, no
-- translations table (same simplification News made — a small
-- admin-controlled vocabulary, not per-locale content). Many-to-many
-- (a tour can be both "Tour Châu Á" and "MICE"), unlike News' one-category
-- rule, so the join table has a composite PK instead of page_id-as-PK.
create table tour_categories (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  icon text,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on tour_categories
  for each row execute function set_updated_at();
create unique index tour_categories_website_slug_idx
  on tour_categories (website_id, lower(slug));
create index tour_categories_website_sort_idx
  on tour_categories (website_id, sort_order);
comment on table tour_categories is
  'Sprint 7: structured Tour category lookup. Real table, real columns, not JSON — same discipline as news_categories.';

create table tour_page_categories (
  page_id uuid not null references cms_pages(id) on delete cascade,
  category_id uuid not null references tour_categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (page_id, category_id)
);
create index tour_page_categories_category_id_idx on tour_page_categories(category_id);
comment on table tour_page_categories is
  'Many-to-many: a Tour (cms_pages whose slug starts with tour/) can belong to multiple categories, unlike News (one category).';

-- Destination tagging — reuses the existing vertical-agnostic
-- `destinations` table (modules/master-data) as-is, zero new lookup
-- table. Many-to-many with an explicit order: a multi-day tour visits
-- several destinations across the itinerary in a meaningful sequence.
create table tour_page_destinations (
  page_id uuid not null references cms_pages(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (page_id, destination_id)
);
create index tour_page_destinations_destination_id_idx on tour_page_destinations(destination_id);
comment on table tour_page_destinations is
  'Which destinations (existing master-data table) a Tour visits, in itinerary order.';

-- Departure dates & pricing — the one part of Tour that is genuinely
-- transactional/queryable (list tours departing in a date range, check
-- seat availability), so it is deliberately NOT block JSON. Founder
-- decision (Sprint 7 Phase 0, confirmed): flat price per departure date
-- for the MVP, no per-room/per-traveler-type matrix yet — matches what's
-- already live in lib/tours/tour-detail-content.ts today. `price_type`
-- and the status vocabulary reuse the exact wording already established
-- in types/cms.ts's AvailabilityStatus/PriceType (uppercase-snake here
-- per this schema's enum convention, mapped at the application layer the
-- same way cms_lifecycle_status already is).
create type tour_departure_status as enum ('OPEN', 'LIMITED', 'ALMOST_FULL', 'CLOSED', 'PENDING_CONFIRMATION');
create type tour_price_type as enum ('ESTIMATE', 'CONFIRMED');

create table tour_departures (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references cms_pages(id) on delete cascade,
  departure_date date not null,
  return_date date,
  price numeric(12, 0) not null,
  currency text not null default 'VND',
  price_type tour_price_type not null default 'ESTIMATE',
  seats_total integer,
  seats_available integer,
  status tour_departure_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (currency = 'VND'), -- V1 is VND-only by design, same constraint as attraction_products
  check (return_date is null or return_date >= departure_date),
  check (seats_available is null or seats_total is null or seats_available <= seats_total)
);
create trigger set_updated_at before update on tour_departures
  for each row execute function set_updated_at();
create index tour_departures_page_id_idx on tour_departures(page_id);
create index tour_departures_departure_date_idx on tour_departures(departure_date);
comment on table tour_departures is
  'One row per bookable departure date for a Tour. Flat price per date for the MVP — no per-room/per-traveler-type matrix.';
