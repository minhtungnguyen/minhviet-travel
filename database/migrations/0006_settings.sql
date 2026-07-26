-- 0006_settings.sql
-- Purpose: master-prompt §8.4 hierarchical System Settings module.
-- Two-table design (definition + value) instead of one key-value dump
-- (explicitly forbidden by master-prompt §8.4): a setting is declared
-- once in `setting_definitions` (type, default, secrecy, visibility),
-- then resolved per-scope in `setting_values`. Resolution order at read
-- time (implemented in modules/settings/application, not in SQL):
-- USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > definition default.
--
-- Sprint 1A.2 reduction: `setting_value_history` was removed — it
-- duplicated what `audit_logs` already records for every mutation
-- (docs/backend/sprint-1a-architecture-review.md §3.4). A settings
-- write logs to `audit_logs` like any other mutation; there is no
-- second, settings-specific history table.

create type settings_scope_level as enum ('GLOBAL', 'ORGANIZATION', 'BRAND', 'WEBSITE', 'USER');
create type setting_value_type as enum ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');
create type setting_visibility as enum ('PUBLIC', 'INTERNAL');

create table setting_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- namespaced, e.g. 'company.hotline', 'seo.default_og_image'
  namespace text not null,  -- e.g. 'company', 'seo', 'booking_policy', 'feature_flag'
  value_type setting_value_type not null,
  default_value jsonb not null default 'null'::jsonb,
  description text not null,
  -- Master-prompt §8.4: "Do not store raw API secrets or passwords in
  -- ordinary settings records." is_secret = true means setting_values.value
  -- for this definition must only ever contain a *reference* (e.g. an env
  -- var name or an integration connection's id), never the secret itself —
  -- enforced at the service layer, not by a DB constraint that can't tell
  -- a reference apart from a real secret.
  is_secret boolean not null default false,
  visibility setting_visibility not null default 'INTERNAL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on setting_definitions
  for each row execute function set_updated_at();

create table setting_values (
  id uuid primary key default gen_random_uuid(),
  setting_definition_id uuid not null references setting_definitions(id) on delete cascade,
  scope_level settings_scope_level not null,
  -- null for GLOBAL only; organizations.id / brands.id / websites.id /
  -- user_profiles.id depending on scope_level (validated at service layer —
  -- no single FK type can span four target tables).
  scope_resource_id uuid,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  unique (setting_definition_id, scope_level, scope_resource_id)
);
create trigger set_updated_at before update on setting_values
  for each row execute function set_updated_at();
create index setting_values_definition_scope_idx on setting_values(setting_definition_id, scope_level, scope_resource_id);
