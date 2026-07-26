-- 0008_media.sql
-- Purpose: master-prompt §8.6 Media Library Foundation, backed by
-- Supabase Storage (storage_path is a Storage object path, not a public
-- URL — visibility/signing is resolved at read time by the service
-- layer per master-prompt §12/§17, never by making the bucket public
-- wholesale).
--
-- Sprint 1A.2 reduction: dropped the redundant `brand_id` column from
-- both tables — a website already belongs to exactly one brand
-- (`websites.brand_id`), so a separately-stored `brand_id` on a media
-- row was derivable and could silently disagree with `website_id`
-- (docs/backend/sprint-1a-architecture-review.md §3.2). Brand-wide media
-- (not tied to one website) uses `website_id IS NULL`; the owning
-- brand is resolved via the uploader's organization membership, not a
-- stored column. Also removed `media_asset_versions`, `media_tags`,
-- `media_asset_tag_mappings`, `media_usages` — no image-processing
-- pipeline or admin media-library UI exists yet to use them; they return
-- when that work starts.

create table media_folders (
  id uuid primary key default gen_random_uuid(),
  website_id uuid references websites(id) on delete cascade,
  parent_folder_id uuid references media_folders(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create trigger set_updated_at before update on media_folders
  for each row execute function set_updated_at();
create index media_folders_parent_folder_id_idx on media_folders(parent_folder_id);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references media_folders(id) on delete set null,
  website_id uuid references websites(id) on delete set null,
  original_filename text not null,
  storage_path text not null unique,
  visibility media_visibility not null default 'PRIVATE',
  mime_type text not null,
  file_size_bytes bigint not null,
  width integer,
  height integer,
  duration_seconds numeric(10, 2),
  alt_text text,
  caption text,
  credit text,
  copyright_info text,
  source text,
  license_status text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger set_updated_at before update on media_assets
  for each row execute function set_updated_at();
create index media_assets_folder_id_idx on media_assets(folder_id);
create index media_assets_website_id_idx on media_assets(website_id);

-- Forward FKs deferred from earlier migrations, now that media_assets exists.
alter table brands add constraint brands_logo_media_id_fkey
  foreign key (logo_media_id) references media_assets(id) on delete set null;
alter table destinations add constraint destinations_media_asset_id_fkey
  foreign key (media_asset_id) references media_assets(id) on delete set null;
alter table user_profiles add constraint user_profiles_avatar_media_id_fkey
  foreign key (avatar_media_id) references media_assets(id) on delete set null;
