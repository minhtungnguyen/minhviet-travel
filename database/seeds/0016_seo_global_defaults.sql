-- 0016_seo_global_defaults.sql
-- Purpose: Sprint 5B "Global SEO defaults" — Founder decision: Website
-- level, reuse the existing 'seo' settings namespace (no new table).
-- `seo.default_og_image` already existed (0004_settings.sql) but had
-- `visibility = 'INTERNAL'`, which blocks the anon client used by public
-- page metadata generation from ever reading it — flipped to 'PUBLIC'
-- here alongside the 2 new keys, same reasoning as the Analytics/GTM/Pixel
-- settings in Sprint 5A: none of these are secrets, they're rendered
-- straight into public <meta>/<head> output the moment they're used.

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('seo.default_title_template', 'seo', 'STRING', '""'::jsonb, 'Fallback meta title template used when a page has no seo_metadata of its own. Use {title} as a placeholder for the page title.', false, 'PUBLIC'),
  ('seo.default_description', 'seo', 'STRING', '""'::jsonb, 'Fallback meta description used when a page has no seo_metadata of its own.', false, 'PUBLIC')
on conflict (key) do update set description = excluded.description;

update setting_definitions set visibility = 'PUBLIC' where key = 'seo.default_og_image';
