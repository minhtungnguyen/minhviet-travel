-- 0012_seo.sql
-- Purpose: master-prompt §8.10 SEO Foundation. `seo_metadata` attaches to
-- any entity via a polymorphic (entity_type, entity_id) pair rather than
-- one FK column per entity type, since the master prompt requires it to
-- later attach to CMS pages, articles, tours, hotels, cruises, tickets,
-- destinations, MICE pages and inspiration pages (§8.10) — a fixed FK
-- would need a schema change per new entity type.
--
-- Sprint 1A.2 reduction: removed `seo_schema_definitions`, `sitemap_entries`,
-- `robots_rules` — all three duplicate something that already works in
-- code today (`components/seo/json-ld.tsx` hand-builds JSON-LD per page
-- type; `app/sitemap.ts`/`app/robots.ts` are working Next.js file-convention
-- routes) with no consumer asking for a DB-driven version
-- (docs/backend/sprint-1a-architecture-review.md §3.10). `seo_metadata`,
-- `redirect_rules`, `slug_history` are kept — these are the three pieces
-- content administrators genuinely need once real pages/slugs exist.
-- Slug uniqueness uses the same case-insensitive fix as `websites.domain`;
-- a new partial unique index prevents two entities on the same website
-- from claiming the same canonical URL.

create table seo_metadata (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  locale text not null references languages(code),
  entity_type text not null, -- e.g. 'cms_page', 'destination' (future: 'tour', 'hotel', ...)
  entity_id uuid not null,
  title text not null,
  meta_description text,
  slug text not null,
  canonical_url text,
  is_indexed boolean not null default true,
  is_followed boolean not null default true,
  og_title text,
  og_description text,
  og_image_media_id uuid references media_assets(id) on delete set null,
  twitter_card_type text default 'summary_large_image',
  featured_image_media_id uuid references media_assets(id) on delete set null,
  structured_data jsonb not null default '{}'::jsonb,
  breadcrumb_config jsonb not null default '[]'::jsonb,
  -- Rows sharing a hreflang_group_id are translations of the same logical
  -- page across locales (master-prompt §8.10 "hreflang preparation").
  hreflang_group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, entity_type, entity_id, locale)
);
create trigger set_updated_at before update on seo_metadata
  for each row execute function set_updated_at();
create index seo_metadata_entity_idx on seo_metadata(entity_type, entity_id);
create index seo_metadata_hreflang_group_id_idx on seo_metadata(hreflang_group_id);
-- Slug uniqueness within (website, locale) across ALL SEO-tracked entities,
-- case-insensitive, so a CMS page and a future tour can never collide on
-- the same public path.
create unique index seo_metadata_website_locale_slug_idx on seo_metadata(website_id, locale, lower(slug));
-- No two entities on the same website may claim the same canonical URL.
create unique index seo_metadata_website_canonical_url_idx
  on seo_metadata(website_id, lower(canonical_url)) where canonical_url is not null;

alter table cms_page_versions add constraint cms_page_versions_seo_metadata_id_fkey
  foreign key (seo_metadata_id) references seo_metadata(id) on delete set null;

create table redirect_rules (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  locale text references languages(code),
  source_path text not null,
  destination_url text not null,
  redirect_kind redirect_kind not null default '301',
  status entity_status not null default 'ACTIVE',
  hit_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, locale, source_path)
);
create trigger set_updated_at before update on redirect_rules
  for each row execute function set_updated_at();
create index redirect_rules_website_id_idx on redirect_rules(website_id);

create table slug_history (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  old_locale text not null references languages(code),
  old_slug text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);
create index slug_history_lookup_idx on slug_history(website_id, old_locale, old_slug);
comment on table slug_history is
  'Written whenever seo_metadata.slug changes, so a 301 can be looked up automatically for an old URL even if no explicit redirect_rules row was created.';
