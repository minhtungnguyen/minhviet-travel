-- 0005_identity_and_rbac.sql
-- Purpose: master-prompt §8.2 (Authentication and User Module) and §8.3
-- (RBAC Module). Supabase Auth (auth.users) is the only password/session
-- authority (master-prompt §8.2: "Do not create a separate password
-- system") — user_profiles is a 1:1 application-side extension of it.
--
-- Role list per sprint-1-implementation-plan.md §1.2: Volume 00's 8 fixed
-- roles, not the master prompt's 13. The scope/permission model below
-- still supports master-prompt §8.3's full scope vocabulary so adding a
-- 9th role or a new scope later is a data change, not a schema change.
--
-- Sprint 1A.2 reduction: `user_brand_memberships` was removed. With
-- exactly one brand in V1, a brand-scoped membership table can never
-- produce a different authorization outcome than
-- `user_organization_memberships` already does — it was a table that
-- could only prove its value once a second brand exists
-- (docs/backend/sprint-1a-architecture-review.md §3.1). The V1
-- authorization model is `user_organization_memberships` +
-- `user_website_access` + `user_roles` + `role_permissions`, as approved.

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_media_id uuid, -- FK added in 0008_media.sql
  locale text not null default 'vi' references languages(code),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  account_status account_status not null default 'INVITED',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger set_updated_at before update on user_profiles
  for each row execute function set_updated_at();
comment on table user_profiles is
  'Application profile for a Supabase Auth user. Never stores password/token data (master-prompt §8.2).';

create table employee_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references user_profiles(id) on delete cascade,
  employee_code text unique,
  department_id uuid references departments(id) on delete set null,
  position_id uuid references positions(id) on delete set null,
  office_id uuid references offices(id) on delete set null,
  manager_id uuid references employee_profiles(id) on delete set null,
  hire_date date,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on employee_profiles
  for each row execute function set_updated_at();
create index employee_profiles_department_id_idx on employee_profiles(department_id);
create index employee_profiles_manager_id_idx on employee_profiles(manager_id);

create table user_organization_memberships (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references user_profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique (user_profile_id, organization_id)
);
create index user_org_memberships_org_id_idx on user_organization_memberships(organization_id);

create table user_website_access (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references user_profiles(id) on delete cascade,
  website_id uuid not null references websites(id) on delete cascade,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique (user_profile_id, website_id)
);
create index user_website_access_website_id_idx on user_website_access(website_id);

-- RBAC ----------------------------------------------------------------

create table roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- e.g. 'SUPER_ADMIN' — see seed data for the fixed 8
  name text not null,
  description text,
  is_system boolean not null default false, -- system roles cannot be deleted via API
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on roles
  for each row execute function set_updated_at();

create table permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- e.g. 'cms.page.publish' — module-scoped dotted convention, master-prompt §8.3
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);
create index permissions_module_idx on permissions(module);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);
create index role_permissions_permission_id_idx on role_permissions(permission_id);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references user_profiles(id) on delete cascade,
  role_id uuid not null references roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (user_profile_id, role_id)
);
create index user_roles_user_profile_id_idx on user_roles(user_profile_id);
create index user_roles_role_id_idx on user_roles(role_id);

create table role_scopes (
  id uuid primary key default gen_random_uuid(),
  user_role_id uuid not null references user_roles(id) on delete cascade,
  scope_level permission_scope_level not null,
  -- Meaningful only for ORGANIZATION/BRAND/WEBSITE/BUSINESS_UNIT; null for
  -- OWN/ASSIGNED/ALL, which are not tied to one resource row.
  scope_resource_id uuid,
  created_at timestamptz not null default now(),
  unique (user_role_id, scope_level, scope_resource_id)
);
create index role_scopes_user_role_id_idx on role_scopes(user_role_id);
comment on table role_scopes is
  'Schema kept, not yet enforced (Sprint 1A.2 review §5): with one active organization/brand/website, a scope check can only ever resolve to "organization-wide" today. auth_has_permission() stays scope-blind until a second website/brand makes scoping meaningful.';
