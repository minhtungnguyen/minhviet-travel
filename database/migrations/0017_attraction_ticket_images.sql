-- 0017_attraction_ticket_images.sql
-- Purpose: fix a Phase 1 gap — attraction_venues/attraction_products had no
-- image reference at all. Uses plain `image_url`/`image_alt text` columns
-- (not `media_asset_id -> media_assets(id)`) because these images are
-- static files bundled under `public/images/` (same pattern as Combo/
-- Flight's seed-driven content), not Supabase-Storage-backed uploads —
-- `media_assets.storage_path` assumes private-bucket resolution this
-- content doesn't need. Zero existing rows (both tables empty at time of
-- writing), so NOT NULL is safe with no backfill.

alter table attraction_venues add column image_url text not null default '';
alter table attraction_venues add column image_alt text not null default '';
alter table attraction_venues alter column image_url drop default;
alter table attraction_venues alter column image_alt drop default;

alter table attraction_products add column image_url text not null default '';
alter table attraction_products add column image_alt text not null default '';
alter table attraction_products alter column image_url drop default;
alter table attraction_products alter column image_alt drop default;
