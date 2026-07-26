-- 0001_extensions_and_helpers.sql
-- Purpose: baseline extensions and shared helper functions/triggers used by
-- every later migration. Nothing here is business-specific.
-- Reversible: yes (drop function/extension), but nothing should depend on
-- reverting this once any later migration has run.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive text (emails, domains)

-- Generic "touch updated_at" trigger, attached per-table in later migrations
-- via: create trigger set_updated_at before update on <table>
--      for each row execute function set_updated_at();
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function set_updated_at() is
  'Sets updated_at = now() on every UPDATE. Attached per-table, not global.';

-- Guards an append-only table (audit_logs, audit_log_changes, security_events)
-- against UPDATE/DELETE by anything other than a migration running as table
-- owner. Application roles never get UPDATE/DELETE grants on these tables
-- (see database/policies), but this trigger is a second, defense-in-depth
-- layer that survives even a misconfigured grant.
create or replace function forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Table % is append-only: % is not permitted', tg_table_name, tg_op;
end;
$$;

comment on function forbid_mutation() is
  'Attached as BEFORE UPDATE/DELETE trigger on append-only tables (audit, security events).';
