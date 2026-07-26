-- 0003_master_data_core.sql
-- Purpose: the small set of master-data lookup tables that the
-- organization hierarchy (0004) needs to reference (default currency,
-- default language, country). Pulled ahead of the rest of master data
-- (0007_master_data_extended.sql) purely to avoid a forward FK reference
-- from organizations/websites — everything else in master-prompt §8.5
-- that depends on `countries` (provinces, destinations, ...) is created
-- later, once the org hierarchy it also references already exists.

create table currencies (
  code char(3) primary key,                 -- ISO 4217, e.g. 'VND'
  name text not null,
  symbol text not null,
  decimal_digits smallint not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on currencies
  for each row execute function set_updated_at();

create table languages (
  code text primary key,                    -- BCP-47-ish, e.g. 'vi', 'en'
  name text not null,
  native_name text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on languages
  for each row execute function set_updated_at();

create table countries (
  code char(2) primary key,                 -- ISO 3166-1 alpha-2
  name text not null,
  native_name text,
  region text,                              -- e.g. 'Southeast Asia' — free text, not a FK; low cardinality, admin-entered
  default_currency_code char(3) references currencies(code),
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on countries
  for each row execute function set_updated_at();

comment on table currencies is 'Master-prompt §8.5. Referenced by organizations, websites, and (later) pricing.';
comment on table languages is 'Master-prompt §8.5 + §19 localization. Referenced by websites.default_locale and CMS locale columns.';
comment on table countries is 'Master-prompt §8.5. Root of the destination hierarchy built in 0007_master_data_extended.sql.';
