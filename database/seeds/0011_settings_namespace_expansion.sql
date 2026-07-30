-- 0011_settings_namespace_expansion.sql
-- Purpose: Backend Foundation sprint follow-up request — expand Settings
-- beyond company/seo/smtp/ai/analytics/webhook (0004, 0010) to also cover
-- Brand/Website/Google/Facebook/TikTok/Zalo/Maps/Storage/Cloudflare.
-- Additive only — no migration, setting_definitions/setting_values
-- already exist.
--
-- Deliberately excludes anything that already has its own dedicated
-- table + admin screen (brands.name, websites.domain, etc. are edited
-- via /api/v1/brands, /api/v1/websites — not duplicated here as
-- settings) and anything secret/credential-shaped (a real Google Maps
-- API key, Cloudflare API token) — those stay environment variables,
-- same reasoning as smtp.password/ai.api_key in 0010.
--
-- `storage.max_upload_size_mb` is the one field here with real, live
-- behavior today: components/admin/media-upload-form.tsx reads it and
-- rejects an oversized file client-side before it ever reaches Supabase
-- Storage. Every other field in this file is intentionally
-- request/reference data with no live integration yet — labeled as such
-- in its own description so the Settings screen never implies a control
-- does something it doesn't.

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('brand.tagline', 'brand', 'STRING', '""'::jsonb, 'Khẩu hiệu thương hiệu hiển thị ở các vị trí marketing.', false, 'PUBLIC'),
  ('website.support_hours', 'website', 'STRING', '""'::jsonb, 'Giờ hỗ trợ khách hàng hiển thị công khai — thông tin tham khảo, chưa có logic tự động theo giờ.', false, 'PUBLIC'),
  ('google.search_console_verification', 'google', 'STRING', '""'::jsonb, 'Mã xác minh Google Search Console (thẻ meta).', false, 'INTERNAL'),
  ('google.business_profile_url', 'google', 'STRING', '""'::jsonb, 'Đường dẫn Google Business Profile.', false, 'PUBLIC'),
  ('facebook.pixel_id', 'facebook', 'STRING', '""'::jsonb, 'Facebook Pixel ID — chưa được nối vào trang public, lưu trước cho tích hợp sau.', false, 'INTERNAL'),
  ('facebook.app_id', 'facebook', 'STRING', '""'::jsonb, 'Facebook App ID cho tích hợp Messenger/Login sau này.', false, 'INTERNAL'),
  ('tiktok.pixel_id', 'tiktok', 'STRING', '""'::jsonb, 'TikTok Pixel ID — chưa được nối vào trang public.', false, 'INTERNAL'),
  ('zalo.oa_id', 'zalo', 'STRING', '""'::jsonb, 'Zalo Official Account ID cho tích hợp Zalo sau này.', false, 'INTERNAL'),
  ('maps.default_zoom', 'maps', 'NUMBER', '14'::jsonb, 'Mức zoom mặc định khi nhúng Google Maps ở trang liên hệ.', false, 'INTERNAL'),
  ('maps.default_center_lat', 'maps', 'NUMBER', '0'::jsonb, 'Vĩ độ mặc định cho bản đồ nhúng.', false, 'INTERNAL'),
  ('maps.default_center_lng', 'maps', 'NUMBER', '0'::jsonb, 'Kinh độ mặc định cho bản đồ nhúng.', false, 'INTERNAL'),
  ('storage.max_upload_size_mb', 'storage', 'NUMBER', '20'::jsonb, 'Giới hạn dung lượng tệp tải lên Media Library (MB) — được kiểm tra thật ở form tải lên.', false, 'INTERNAL'),
  ('cloudflare.zone_id', 'cloudflare', 'STRING', '""'::jsonb, 'Zone ID Cloudflare — tham chiếu nội bộ, chưa có tích hợp tự động purge cache.', false, 'INTERNAL')
on conflict (key) do update set description = excluded.description;
