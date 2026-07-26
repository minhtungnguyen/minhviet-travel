-- 0004_settings.sql
-- Definitions + one ORGANIZATION-scoped value each, using the org id
-- fixed in 0002_organization.sql. `visibility = 'PUBLIC'` definitions
-- are the ones the public website is allowed to read directly (per
-- database/policies/0003 "public_read_public_setting_values").

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('company.hotline', 'company', 'STRING', '""'::jsonb, 'Primary customer hotline number shown in the header/footer.', false, 'PUBLIC'),
  ('company.email', 'company', 'STRING', '""'::jsonb, 'Primary contact email address.', false, 'PUBLIC'),
  ('company.address', 'company', 'STRING', '""'::jsonb, 'Registered office address shown in the footer.', false, 'PUBLIC'),
  ('company.social_facebook', 'company', 'STRING', '""'::jsonb, 'Facebook page URL.', false, 'PUBLIC'),
  ('company.social_zalo', 'company', 'STRING', '""'::jsonb, 'Zalo contact URL.', false, 'PUBLIC'),
  ('seo.default_og_image', 'seo', 'STRING', '""'::jsonb, 'Fallback Open Graph image path when a page has none of its own.', false, 'INTERNAL'),
  ('booking_policy.deposit_percent', 'booking_policy', 'NUMBER', '0'::jsonb, 'Placeholder default deposit percentage for future Booking Request module.', false, 'INTERNAL'),
  ('cancellation_policy.summary', 'cancellation_policy', 'STRING', '""'::jsonb, 'Short public-facing cancellation policy summary.', false, 'PUBLIC'),
  ('feature_flag.ai_advisor_enabled', 'feature_flag', 'BOOLEAN', 'true'::jsonb, 'Toggles the homepage AI Advisor section.', false, 'INTERNAL')
on conflict (key) do update set description = excluded.description;

insert into setting_values (setting_definition_id, scope_level, scope_resource_id, value)
select sd.id, 'ORGANIZATION', '00000000-0000-4000-8000-000000000001', v.value
from setting_definitions sd
join (values
  ('company.hotline', '"1900 xxxx"'::jsonb),
  ('company.email', '"booking@minhviettravel.com"'::jsonb),
  ('company.address', '"Hà Nội, Việt Nam"'::jsonb),
  ('feature_flag.ai_advisor_enabled', 'true'::jsonb)
) as v(key, value) on v.key = sd.key
on conflict (setting_definition_id, scope_level, scope_resource_id) do update set value = excluded.value;
