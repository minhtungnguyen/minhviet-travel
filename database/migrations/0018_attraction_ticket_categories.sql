-- 0018_attraction_ticket_categories.sql
-- Purpose: category taxonomy for the Attraction Ticket module — locked as
-- decision D2 in docs/design/DESIGN-BIBLE-v1.0.md (separate relational
-- table, not a tag/jsonb column) and previewed for approval in
-- docs/design/mv-ticket/15-review-package-v1.md §1/§8. Additive only —
-- does not alter or touch 0016/0017 in any way.
--
-- Static taxonomy, not editorial content with a publish lifecycle: no
-- `status`/`deleted_at` column here (unlike attraction_venues/products),
-- matching 03-database-design.md's own reasoning for keeping this out of
-- V1 scope until a real need for a Draft/Published workflow appears.

create table attraction_categories (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  slug text not null,
  icon_key text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on attraction_categories
  for each row execute function set_updated_at();
create index attraction_categories_website_id_idx on attraction_categories(website_id);
-- Function-based uniqueness needs an index, not an inline UNIQUE table
-- constraint — same pattern as attraction_venues_website_slug_idx in 0016.
create unique index attraction_categories_website_slug_idx on attraction_categories(website_id, lower(slug));

comment on column attraction_categories.icon_key is
  'Short key mapped to a Lucide icon name client-side (docs/design/mv-ticket/08-iconography.md §3) — never raw SVG/markup stored here.';

create table attraction_category_translations (
  id uuid primary key default gen_random_uuid(),
  attraction_category_id uuid not null references attraction_categories(id) on delete cascade,
  locale text not null references languages(code),
  name text not null,
  unique (attraction_category_id, locale)
);

create table attraction_product_categories (
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  attraction_category_id uuid not null references attraction_categories(id) on delete cascade,
  primary key (attraction_product_id, attraction_category_id)
);
create index attraction_product_categories_category_id_idx on attraction_product_categories(attraction_category_id);
