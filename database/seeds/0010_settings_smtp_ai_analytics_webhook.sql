-- 0010_settings_smtp_ai_analytics_webhook.sql
-- Purpose: Admin Shell Settings screen (Backend Foundation sprint,
-- requirement #9) needs SMTP/AI/Analytics/Webhook namespaces alongside
-- the existing company/seo/booking_policy/cancellation_policy/
-- feature_flag ones seeded in 0004_settings.sql. Additive only — no
-- migration, `setting_definitions`/`setting_values` already exist.
--
-- Deliberately NOT seeded here: `smtp.password`, `ai.api_key` — any
-- would-be-secret definition is is_secret=true, and
-- SettingsService#putSettingValue (modules/settings/application/
-- settings.service.ts) unconditionally rejects writes to a secret
-- definition ("cannot be written through this endpoint") because
-- docs/security/secret-management.md forbids storing secrets in an
-- ordinary table column at all. Those stay environment variables
-- (SMTP_PASSWORD, AI_API_KEY — add to .env.example when a real SMTP/AI
-- provider is wired), same pattern as SUPABASE_SERVICE_ROLE_KEY /
-- ONEINVENTORY_API_KEY today. This file only adds the non-secret
-- configuration knobs that legitimately belong in setting_values.
--
-- `webhook.outbound_url` is a NEW, generic future-integration hook —
-- distinct from the existing LEADS_WEBHOOK_URL/NEWSLETTER_WEBHOOK_URL
-- env vars (lib/actions/lead-action.ts, newsletter-action.ts), which
-- stay env-based; this does not replace or alias them.

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('smtp.host', 'smtp', 'STRING', '""'::jsonb, 'SMTP server hostname for outbound transactional email.', false, 'INTERNAL'),
  ('smtp.port', 'smtp', 'NUMBER', '587'::jsonb, 'SMTP server port.', false, 'INTERNAL'),
  ('smtp.username', 'smtp', 'STRING', '""'::jsonb, 'SMTP auth username (often the sending address itself).', false, 'INTERNAL'),
  ('smtp.from_email', 'smtp', 'STRING', '""'::jsonb, 'Default "From" address for transactional email.', false, 'INTERNAL'),
  ('smtp.from_name', 'smtp', 'STRING', '"Minh Việt Travel"'::jsonb, 'Default "From" display name for transactional email.', false, 'INTERNAL'),
  ('smtp.use_tls', 'smtp', 'BOOLEAN', 'true'::jsonb, 'Whether to use STARTTLS when connecting to the SMTP server.', false, 'INTERNAL'),
  ('ai.provider', 'ai', 'STRING', '"anthropic"'::jsonb, 'AI provider used for future content generation/rewrite/translate/SEO-optimize features.', false, 'INTERNAL'),
  ('ai.model', 'ai', 'STRING', '""'::jsonb, 'Default model identifier for AI-assisted content features.', false, 'INTERNAL'),
  ('analytics.ga4_measurement_id', 'analytics', 'STRING', '""'::jsonb, 'Google Analytics 4 measurement id (e.g. G-XXXXXXX).', false, 'INTERNAL'),
  ('analytics.gtm_container_id', 'analytics', 'STRING', '""'::jsonb, 'Google Tag Manager container id (e.g. GTM-XXXXXXX).', false, 'INTERNAL'),
  ('webhook.outbound_url', 'webhook', 'STRING', '""'::jsonb, 'Generic outbound webhook for future integrations — distinct from the env-based lead/newsletter webhooks.', false, 'INTERNAL')
on conflict (key) do update set description = excluded.description;
