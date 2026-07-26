-- 0001_helper_functions.sql
-- Purpose: shared SQL helper functions every RLS policy below calls,
-- instead of each policy re-deriving "does this user have permission X"
-- inline. `security definer` + a fixed `search_path` is required because
-- these functions are called from policies running as arbitrary
-- authenticated roles but need to read RBAC tables regardless of the
-- caller's own row-level access to them.
--
-- These are NOT executed in Sprint 1A (no live project — see
-- sprint-1-implementation-plan.md §1.4). Applied together with the
-- migrations in Sprint 1B.

create or replace function auth_user_organization_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id
  from user_organization_memberships
  where user_profile_id = auth.uid() and status = 'ACTIVE';
$$;

create or replace function auth_user_website_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  -- Sprint 1A.2: user_brand_memberships was removed (docs/backend/
  -- sprint-1a2-reduction-report.md §3) — organization membership now
  -- implies access to every website under every brand that organization
  -- owns; user_website_access remains for narrower, explicit grants
  -- (e.g. a contractor scoped to a single site who isn't a full org member).
  select w.id
  from websites w
  join brands b on b.id = w.brand_id
  where b.organization_id in (select auth_user_organization_ids())
  union
  select website_id from user_website_access
  where user_profile_id = auth.uid() and status = 'ACTIVE';
$$;

create or replace function auth_has_permission(permission_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    join permissions p on p.id = rp.permission_id
    where ur.user_profile_id = auth.uid()
      and p.key = permission_key
  );
$$;

comment on function auth_user_organization_ids() is
  'Organizations the current auth.uid() has an ACTIVE membership in.';
comment on function auth_user_website_ids() is
  'Websites reachable to the current auth.uid() via organization membership (all of that org''s websites) or explicit user_website_access.';
comment on function auth_has_permission(text) is
  'True if the current auth.uid() holds a role granting the given permission key, at ANY scope. Fine-grained scope checks (this website only, own records only) happen in the service layer (shared/auth/session.ts), not here — RLS is the coarse "can this table row ever be touched by this user" gate.';
