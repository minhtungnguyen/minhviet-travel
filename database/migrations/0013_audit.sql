-- 0013_audit.sql
-- Purpose: master-prompt §8.11. Append-only by construction: application
-- roles get INSERT/SELECT grants only (see database/policies), and the
-- forbid_mutation() trigger from 0001 is a second layer that raises even
-- if a grant is ever misconfigured — "Protect audit logs from ordinary
-- editing or deletion" (master-prompt §8.11) is enforced at the database,
-- not trusted to application code alone.
--
-- Renumbered from 0015 to 0013 in Sprint 1A.2 after the Notifications
-- (old 0013) and Integration Registry (old 0014) migrations were removed
-- entirely (docs/backend/sprint-1a2-reduction-report.md). Content below
-- is otherwise unchanged.

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id), -- null = system-initiated action
  organization_id uuid references organizations(id),
  website_id uuid references websites(id),
  action text not null, -- dotted convention, e.g. 'user.role.updated', 'cms.page.published'
  entity_type text not null,
  entity_id uuid,
  request_id uuid,
  source text not null default 'api', -- 'api' | 'admin-ui' | 'system'
  success boolean not null default true,
  reason text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs(entity_type, entity_id);
create index audit_logs_actor_user_id_idx on audit_logs(actor_user_id);
create index audit_logs_organization_id_idx on audit_logs(organization_id);
create index audit_logs_created_at_idx on audit_logs(created_at desc);
create trigger audit_logs_forbid_mutation
  before update or delete on audit_logs
  for each row execute function forbid_mutation();

create table audit_log_changes (
  id uuid primary key default gen_random_uuid(),
  audit_log_id uuid not null references audit_logs(id) on delete cascade,
  field_name text not null,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_changes_audit_log_id_idx on audit_log_changes(audit_log_id);
create trigger audit_log_changes_forbid_mutation
  before update or delete on audit_log_changes
  for each row execute function forbid_mutation();

create table security_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  event_type text not null, -- e.g. 'LOGIN_FAILURE', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY'
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index security_events_event_type_idx on security_events(event_type);
create index security_events_created_at_idx on security_events(created_at desc);
create trigger security_events_forbid_mutation
  before update or delete on security_events
  for each row execute function forbid_mutation();
