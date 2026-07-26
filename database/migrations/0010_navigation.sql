-- 0010_navigation.sql
-- Purpose: master-prompt §8.8. Navigation is website-specific,
-- locale-aware, hierarchical (self-referencing parent_item_id) and can
-- point at an internal cms_pages row or an arbitrary external URL, but
-- not both — enforced by a check constraint rather than trusting the
-- admin UI to only fill in one.

create type navigation_menu_key as enum (
  'HEADER', 'FOOTER', 'MOBILE', 'SERVICE', 'LEGAL', 'SOCIAL', 'ANNOUNCEMENT_BAR'
);

create table navigation_menus (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  key navigation_menu_key not null,
  locale text not null references languages(code),
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, key, locale)
);
create trigger set_updated_at before update on navigation_menus
  for each row execute function set_updated_at();

create table navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references navigation_menus(id) on delete cascade,
  parent_item_id uuid references navigation_items(id) on delete cascade,
  label text not null,
  url text,
  cms_page_id uuid references cms_pages(id) on delete set null,
  is_external boolean not null default false,
  open_in_new_tab boolean not null default false,
  position integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint navigation_items_target_chk check (
    (url is not null and cms_page_id is null) or
    (url is null and cms_page_id is not null) or
    (url is null and cms_page_id is null) -- allowed: a pure grouping label with children
  )
);
create trigger set_updated_at before update on navigation_items
  for each row execute function set_updated_at();
create index navigation_items_menu_id_idx on navigation_items(menu_id);
create index navigation_items_parent_item_id_idx on navigation_items(parent_item_id);
