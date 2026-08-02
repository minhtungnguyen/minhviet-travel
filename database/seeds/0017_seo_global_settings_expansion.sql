-- 0017_seo_global_settings_expansion.sql
-- Purpose: Sprint 5B round 2, Founder decision — expand Global SEO
-- settings. Reuses the existing 'seo' settings namespace (no new table),
-- same pattern as 0016_seo_global_defaults.sql. All PUBLIC visibility —
-- none of these are secrets, all render into public <head>/JSON-LD output.

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('seo.site_name', 'seo', 'STRING', '""'::jsonb, 'Short site name used for og:site_name (distinct from the full legal Organization Name).', false, 'PUBLIC'),
  ('seo.default_robots', 'seo', 'STRING', '"index, follow"'::jsonb, 'Fallback robots directive for pages with no seo_metadata of their own.', false, 'PUBLIC'),
  ('seo.canonical_base_url', 'seo', 'STRING', '""'::jsonb, 'Base URL used to build canonical/OG urls. Falls back to the SITE_URL constant when empty.', false, 'PUBLIC'),
  ('seo.twitter_card_type', 'seo', 'STRING', '"summary_large_image"'::jsonb, 'Twitter/X card type.', false, 'PUBLIC'),
  ('seo.organization_name', 'seo', 'STRING', '""'::jsonb, 'Organization legal name for JSON-LD. Falls back to the constants/seo.ts value when empty.', false, 'PUBLIC'),
  ('seo.organization_logo', 'seo', 'STRING', '""'::jsonb, 'Organization logo path/URL for JSON-LD. Falls back to the constants/seo.ts value when empty.', false, 'PUBLIC'),
  ('seo.google_site_verification', 'seo', 'STRING', '""'::jsonb, 'Google Search Console verification meta tag content.', false, 'PUBLIC'),
  ('seo.bing_site_verification', 'seo', 'STRING', '""'::jsonb, 'Bing Webmaster Tools verification meta tag content.', false, 'PUBLIC'),
  ('seo.facebook_app_id', 'seo', 'STRING', '""'::jsonb, 'Facebook App ID (fb:app_id meta tag).', false, 'PUBLIC')
on conflict (key) do update set description = excluded.description;
