-- 0011_forms.sql
-- Purpose: master-prompt §8.9 Forms Foundation — reduced per approved
-- decision (docs/backend/sprint-1a2-reduction-report.md §4). The
-- original design (`form_definitions`/`form_versions`/`form_fields`/
-- `form_submission_values` EAV chain, plus `form_routing_rules`/
-- `form_notification_rules`) modeled a dynamic, admin-configurable form
-- builder nobody asked for — V1's actual forms (contact, MICE
-- consultation, custom tour request) are still defined in code
-- (Zod schemas + React), matching the existing working pattern in this
-- repo (`lib/cms/schema.ts`).
--
-- Replaced with exactly two tables: `forms` (a minimal catalog — just
-- enough for a real FK instead of an unvalidated free-text key) and
-- `form_submissions`, with every operational field the approved decision
-- named as a first-class column (filtering, dedup, consent, reporting,
-- future CRM mapping all need to query these directly) and a `payload`
-- JSONB column for whatever is specific to one form's own fields.
--
-- No form routing, notification, or workflow table exists here — that
-- remains CRM/Sprint 2 territory (docs/architecture/future-travel-domains.md).

create table forms (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  key text not null, -- e.g. 'contact', 'mice-consultation', 'custom-tour-request'
  name text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on forms
  for each row execute function set_updated_at();
create unique index forms_website_key_idx on forms(website_id, lower(key));

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  -- Denormalized alongside website_id (rather than derived via
  -- website -> brand -> organization) specifically so reporting queries
  -- ("all submissions for this organization") don't need a join —
  -- approved as an intentional exception to the "no redundant ownership
  -- columns" rule elsewhere in this schema.
  organization_id uuid not null references organizations(id) on delete cascade,
  website_id uuid not null references websites(id) on delete cascade,
  form_id uuid not null references forms(id) on delete restrict,
  submission_type text not null, -- e.g. 'corporate' / 'individual' — validated at the app layer, not a DB enum (mirrors product_types' rationale: this vocabulary may grow without a migration)
  status form_submission_status not null default 'NEW',
  full_name text not null,
  phone text not null,
  email text,
  source_url text,
  source_page_id uuid references cms_pages(id) on delete set null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  consent_marketing boolean not null default false,
  consent_privacy boolean not null default false,
  anonymous_session_id text,
  -- Computed by the service layer (e.g. a client-generated request id, or
  -- a hash of form + session + short time bucket) so a unique index can
  -- catch accidental double-submits without a bespoke rate limiter.
  idempotency_key text,
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on form_submissions
  for each row execute function set_updated_at();

-- Justified indexes only (approved decision §4) — each maps to a named
-- query pattern, not "might be useful":
create index form_submissions_website_status_submitted_idx
  on form_submissions(website_id, status, submitted_at desc); -- staff inbox: this website's NEW submissions, newest first
create index form_submissions_form_submitted_idx
  on form_submissions(form_id, submitted_at desc); -- per-form volume/reporting
create index form_submissions_phone_idx on form_submissions(phone); -- lookup/dedup by phone
create index form_submissions_email_idx on form_submissions(email) where email is not null; -- lookup/dedup by email
create unique index form_submissions_idempotency_key_idx
  on form_submissions(idempotency_key) where idempotency_key is not null; -- duplicate-submission guard
