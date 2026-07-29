-- 0019_attraction_ticket_gallery.sql
-- Purpose: multi-image gallery for Product Detail — locked as decision in
-- docs/design/mv-ticket/13-asset-library-strategy.md §3 (option (b), jsonb
-- column) and approved in docs/design/mv-ticket/15-review-package-v1.md
-- §2. Same reasoning as 0017_attraction_ticket_images.sql: these are
-- static files under public/images/, not media_assets-backed uploads, so
-- a jsonb column matches the existing image_url/image_alt pattern instead
-- of a new table + FK + index.
--
-- '[]' is a valid permanent default (an empty gallery is a legitimate
-- state — falls back to the single card image), not a placeholder that
-- needs backfilling, so no drop-default step like 0017 needed here.

alter table attraction_products add column gallery_images jsonb not null default '[]';

comment on column attraction_products.gallery_images is
  'Array of {url, alt, sortOrder} objects — static files under public/images/, same pattern as image_url/image_alt (0017). Not media_assets-backed. Empty array is a valid permanent state, falls back to image_url/image_alt for a single-image display.';
