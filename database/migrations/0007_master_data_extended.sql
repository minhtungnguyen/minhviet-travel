-- 0007_master_data_extended.sql
-- Purpose: master-prompt §8.5 master data, minus the currency/language/
-- country tables already created in 0003 (needed earlier by organizations).
--
-- `provinces`/`cities` are plain administrative-division lookups (used for
-- addresses on offices/organizations). `destinations` is a *separate*,
-- content/marketing-oriented hierarchy (Country → Region → Province/City →
-- Destination → Attraction, master-prompt §8.5) that does not have to
-- line up 1:1 with administrative boundaries — a destination like "Vịnh
-- Hạ Long" spans multiple administrative units.
--
-- Sprint 1A.2 reduction: `airports`, `harbors`, `transportation_types`,
-- `supplier_types`, `units_of_measure`, `tax_categories` were removed —
-- none has a Sprint 1B consumer (no Flight/Cruise/Supplier/Pricing
-- domain exists yet); each returns with its owning domain's own
-- migration (docs/backend/sprint-1a2-reduction-report.md). `product_types`
-- and `customer_types` are kept because CRM and Booking (the immediate
-- next domains) will need them right away.

create table provinces (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null references countries(code),
  name text not null,
  code text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, code)
);
create trigger set_updated_at before update on provinces
  for each row execute function set_updated_at();

create table cities (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references provinces(id) on delete restrict,
  name text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on cities
  for each row execute function set_updated_at();
create index cities_province_id_idx on cities(province_id);

create type destination_type as enum ('COUNTRY', 'REGION', 'PROVINCE_CITY', 'DESTINATION', 'ATTRACTION');

create table destinations (
  id uuid primary key default gen_random_uuid(),
  parent_destination_id uuid references destinations(id) on delete restrict,
  destination_type destination_type not null,
  country_code char(2) references countries(code),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_featured boolean not null default false,
  media_asset_id uuid, -- FK added in 0008_media.sql
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger set_updated_at before update on destinations
  for each row execute function set_updated_at();
create index destinations_parent_destination_id_idx on destinations(parent_destination_id);
create index destinations_country_code_idx on destinations(country_code);

create table destination_translations (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  locale text not null references languages(code),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, locale)
);
create trigger set_updated_at before update on destination_translations
  for each row execute function set_updated_at();
-- Case-insensitive per docs/backend/sprint-1a-architecture-review.md §3.11's
-- fix pattern applied to every public-URL-bearing slug column.
create unique index destination_translations_locale_slug_idx on destination_translations(locale, lower(slug));
comment on table destination_translations is
  'Localization pattern per master-prompt §19: one translation row per (destination, locale), not a duplicated destination entity.';

-- Simple admin-editable lookup tables (master-prompt §8.5: these are
-- deliberately tables, not enums, so operations staff can add a row
-- without a migration; see 0002's comment on when to use an enum instead).

create table product_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- TOUR, HOTEL, RESORT, HOMESTAY, CRUISE, FLIGHT, ATTRACTION_TICKET,
                              -- EXPERIENCE, COMBO, TRANSFER, CAR_RENTAL, VISA, INSURANCE, MICE,
                              -- EVENT, GUIDE_SERVICE, OTHER (master-prompt §8.5) — seeded, not enforced
                              -- by a CHECK, so a future product type is a data change.
  name text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on product_types
  for each row execute function set_updated_at();

create table customer_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. INDIVIDUAL, CORPORATE, AGENCY, GOVERNMENT
  name text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on customer_types
  for each row execute function set_updated_at();
