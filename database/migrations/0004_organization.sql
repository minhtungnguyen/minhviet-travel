-- 0004_organization.sql
-- Purpose: master-prompt §8.1 core organizational hierarchy.
-- Ownership model (master-prompt §10, "use normalized ownership
-- relationships" rather than stamping organization_id/brand_id/website_id
-- on everything): brands belong to organizations; websites belong to
-- brands; an organization/brand is reachable from a website by joining
-- through brands, it is not duplicated as a column.
--
-- Hybrid multi-site scope decision (sprint-1-implementation-plan.md §1.1):
-- this schema supports many organizations/brands/websites, but Sprint 1A
-- seeds exactly one active organization, one active brand, one active
-- website (minhviettravel.com) plus one PLANNED website
-- (vemaybay.minhviettravel.com).
--
-- Sprint 1A.2 fix: `websites.domain` previously had both a column-level
-- `unique` constraint AND a partial unique index intended to allow domain
-- reuse after soft-delete — the blanket constraint made the partial index
-- dead code and silently broke that intent (docs/backend/
-- sprint-1a-architecture-review.md §3.11). Fixed below: domain uniqueness
-- is expressed ONLY as one case-insensitive partial index scoped to
-- non-deleted rows. `brands.slug` gets the same case-insensitive
-- treatment for consistency (flagged, not urgent, in the same review).

create table organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  tax_code text,
  business_registration_number text,
  address_line1 text,
  address_line2 text,
  city text,
  country_code char(2) references countries(code),
  phone text,
  email citext,
  default_currency_code char(3) not null references currencies(code),
  default_language_code text not null references languages(code),
  default_timezone text not null default 'Asia/Ho_Chi_Minh',
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);
create trigger set_updated_at before update on organizations
  for each row execute function set_updated_at();

create table brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  name text not null,
  slug text not null,
  display_name text not null,
  description text,
  -- FK to media_assets added in 0008_media.sql (alter table) once that
  -- table exists — see docs/database/migration-strategy.md "forward refs".
  logo_media_id uuid,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  unique (organization_id, name)
);
create trigger set_updated_at before update on brands
  for each row execute function set_updated_at();
create index brands_organization_id_idx on brands(organization_id);
-- Global (not per-organization) uniqueness is a deliberate, documented
-- simplification for a single-organization V1 — see
-- docs/database/data-dictionary.md for the note to revisit once a second
-- organization exists.
create unique index brands_slug_idx on brands(lower(slug));

create type website_type as enum ('MAIN_SITE', 'SERVICE_APP', 'PARTNER_PORTAL', 'INTERNAL');
comment on type website_type is
  'MAIN_SITE = minhviettravel.com. SERVICE_APP = vemaybay.minhviettravel.com and similar. PARTNER_PORTAL/INTERNAL reserved for future use.';

create table websites (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete restrict,
  domain citext not null,
  subdomain text,
  name text not null,
  website_type website_type not null default 'MAIN_SITE',
  default_locale text not null references languages(code),
  default_currency_code char(3) not null references currencies(code),
  theme_key text not null default 'default',
  -- Structured, non-secret display config only (master-prompt §8.1:
  -- "Do not store secrets directly in website configuration records").
  seo_defaults jsonb not null default '{}'::jsonb,
  analytics_settings_ref jsonb not null default '{}'::jsonb,
  contact_settings_ref jsonb not null default '{}'::jsonb,
  status website_status not null default 'PLANNED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);
create trigger set_updated_at before update on websites
  for each row execute function set_updated_at();
create index websites_brand_id_idx on websites(brand_id);
-- The ONLY uniqueness rule for domain: case-insensitive, active rows
-- only. A domain becomes reusable the moment its old website row is
-- soft-deleted — no other constraint on this column exists.
create unique index websites_domain_active_unique on websites (lower(domain)) where deleted_at is null;

create table business_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);
create trigger set_updated_at before update on business_units
  for each row execute function set_updated_at();

create table offices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  country_code char(2) references countries(code),
  phone text,
  is_headquarters boolean not null default false,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on offices
  for each row execute function set_updated_at();
create index offices_organization_id_idx on offices(organization_id);

create table departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete restrict,
  business_unit_id uuid references business_units(id) on delete set null,
  office_id uuid references offices(id) on delete set null,
  parent_department_id uuid references departments(id) on delete set null,
  name text not null,
  code text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);
create trigger set_updated_at before update on departments
  for each row execute function set_updated_at();
create index departments_organization_id_idx on departments(organization_id);
create index departments_parent_department_id_idx on departments(parent_department_id);

create table positions (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  title text not null,
  level smallint,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on positions
  for each row execute function set_updated_at();
create index positions_department_id_idx on positions(department_id);
