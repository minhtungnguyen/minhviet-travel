-- 0021_news_categories.sql
-- Purpose: Sprint 5A, Founder decision #5 ("News Categories"), revised per
-- Founder's explicit field list and requirement to keep the category
-- assignment fully relational (no JSON storage for categories, including
-- the article-to-category link — not just the lookup table itself).
--
-- `news_categories`: the lookup table. `website_id` is not in Founder's
-- literal field list but is added anyway — every other content/lookup
-- table in this schema is website_id-scoped (modules/cms/domain/types.ts's
-- own header comment: "nothing here assumes a single website"), and
-- omitting it here would be a real regression once a second
-- website/brand exists. No `created_by`/`updated_by` — Founder's list
-- didn't ask for them and nothing here requires them structurally
-- (unlike `updated_at`, which needs the shared trigger to behave).
-- No soft delete (Founder decision #3) — no `deleted_at` column.
--
-- `news_article_categories`: the article -> category assignment, kept as
-- its own small relational table (1 row per News article, `page_id` is
-- both PK and the FK) rather than inside `cms_blocks.config` JSON —
-- this is the part of the design that changed from the first preview.
-- `on delete restrict` on `category_id` is a plain data-integrity
-- guard (can't delete a category still assigned to an article without
-- reassigning first) — unrelated to the "no soft delete" decision, which
-- is about not adding a deleted_at/recycle-bin mechanism, not about
-- referential integrity.
--
-- Additive only. No DROP, no DELETE.

create table news_categories (
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

create trigger set_updated_at before update on news_categories
  for each row execute function set_updated_at();

create unique index news_categories_website_slug_idx
  on news_categories (website_id, lower(slug));

create index news_categories_website_sort_idx
  on news_categories (website_id, sort_order);

comment on table news_categories is
  'Sprint 5A: structured News category lookup. Real table, real columns — deliberately not JSON, including the article assignment (see news_article_categories).';

create table news_article_categories (
  page_id uuid primary key references cms_pages(id) on delete cascade,
  category_id uuid not null references news_categories(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index news_article_categories_category_id_idx
  on news_article_categories (category_id);

comment on table news_article_categories is
  'One row per News article (cms_pages whose slug starts with tin-tuc/) assigning it to exactly one news_categories row. Kept separate from cms_pages/cms_page_versions to avoid adding a News-specific column to the generic Pages tables.';
