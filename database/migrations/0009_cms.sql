-- 0009_cms.sql
-- Purpose: master-prompt §8.7 CMS Foundation. Content is versioned
-- (cms_page_versions) with a mutable "is_current" pointer per status
-- rather than cms_pages holding a circular FK to its own current
-- version — this keeps insert order simple (page, then version) and
-- avoids a chicken-and-egg FK. "What's live" is answered by a query
-- (`is_current = true and status = 'PUBLISHED'`), not a stored pointer.
-- No column ever stores raw executable HTML/script for block content
-- (master-prompt §8.7: "Do not allow arbitrary executable scripts
-- inside CMS content") — `config` is structured JSON rendered by a
-- fixed set of block components, never `dangerouslySetInnerHTML`.
--
-- Sprint 1A.2 reduction: removed `cms_templates`, `cms_page_template_mappings`
-- and `reusable_content_blocks` — a named-template-picker layer and a
-- cross-page reusable-block library both make sense once there are many
-- pages needing admin-selectable, consistent layouts; today (and in this
-- repo's existing frontend) page composition is hardcoded per page in
-- React, with no dynamic template picker planned
-- (docs/backend/sprint-1a-architecture-review.md §3.8/§3.9). Dropped
-- `cms_page_versions.template_id` along with `cms_templates`. Slugs use
-- the same case-insensitive partial-unique-index fix as `websites.domain`.

create type cms_page_type as enum (
  'HOME', 'SERVICE_HUB', 'LANDING_PAGE', 'STATIC_PAGE', 'PROGRAM_INSPIRATION',
  'ARTICLE_INDEX', 'PRODUCT_INDEX', 'CONTACT', 'POLICY', 'CUSTOM'
);

create table cms_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  locale text not null references languages(code),
  page_type cms_page_type not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);
create trigger set_updated_at before update on cms_pages
  for each row execute function set_updated_at();
create unique index cms_pages_website_locale_slug_idx
  on cms_pages(website_id, locale, lower(slug)) where deleted_at is null;
comment on table cms_pages is
  'Slug uniqueness is scoped to (website_id, locale) per master-prompt §19/§30, case-insensitive, enforced here, not just at the app layer.';

create table cms_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references cms_pages(id) on delete cascade,
  version_number integer not null,
  status cms_lifecycle_status not null default 'DRAFT',
  title text not null,
  seo_metadata_id uuid, -- FK added in 0012_seo.sql
  is_current boolean not null default false,
  scheduled_publish_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (page_id, version_number)
);
create index cms_page_versions_page_id_idx on cms_page_versions(page_id);
create unique index cms_page_versions_current_idx
  on cms_page_versions(page_id) where is_current;
comment on table cms_page_versions is
  'Draft/review/publish/archive workflow (master-prompt §8.7). Public reads filter on status = PUBLISHED and is_current = true.';

create table cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_version_id uuid not null references cms_page_versions(id) on delete cascade,
  section_key text not null,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (page_version_id, position)
);
create index cms_sections_page_version_id_idx on cms_sections(page_version_id);

create table cms_block_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- HERO, RICH_TEXT, IMAGE, VIDEO, GALLERY, CARDS, PRODUCT_CARDS,
                             -- DESTINATION_CARDS, TIMELINE, STATISTICS, TESTIMONIALS, FAQ, CTA,
                             -- FORM, LOGO_GRID, CASE_STUDIES, RELATED_CONTENT, SERVICE_SELECTOR,
                             -- SEARCH_PLACEHOLDER, CUSTOM (master-prompt §8.7)
  name text not null,
  -- JSON Schema describing the shape `cms_blocks.config` must satisfy for
  -- this block type. Authoritative validation still happens via a Zod
  -- schema per block key in modules/cms/schemas (this column documents
  -- the contract for admin-UI form generation, it does not replace Zod).
  config_schema jsonb not null default '{}'::jsonb,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on cms_block_definitions
  for each row execute function set_updated_at();

create table cms_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references cms_sections(id) on delete cascade,
  block_definition_id uuid not null references cms_block_definitions(id) on delete restrict,
  position integer not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, position)
);
create trigger set_updated_at before update on cms_blocks
  for each row execute function set_updated_at();
create index cms_blocks_section_id_idx on cms_blocks(section_id);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  message text not null,
  link_href text,
  starts_at timestamptz,
  ends_at timestamptz,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on announcements
  for each row execute function set_updated_at();
create index announcements_website_id_idx on announcements(website_id);

create table faq_categories (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  name text not null,
  slug text not null,
  position integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on faq_categories
  for each row execute function set_updated_at();
create unique index faq_categories_website_slug_idx on faq_categories(website_id, lower(slug));

create table faqs (
  id uuid primary key default gen_random_uuid(),
  faq_category_id uuid not null references faq_categories(id) on delete cascade,
  website_id uuid not null references websites(id) on delete cascade,
  locale text not null references languages(code),
  question text not null,
  answer text not null,
  position integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on faqs
  for each row execute function set_updated_at();
create index faqs_faq_category_id_idx on faqs(faq_category_id);
