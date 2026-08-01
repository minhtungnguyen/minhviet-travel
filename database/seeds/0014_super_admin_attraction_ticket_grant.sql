-- 0014_super_admin_attraction_ticket_grant.sql
-- Purpose: close the RBAC gap identified in docs/backend/admin-os/05-rbac-gap-report.md.
-- SUPER_ADMIN ("Full platform access") currently holds 0/8 attraction_ticket.*
-- permissions because 0006_attraction_ticket.sql and
-- 0008_attraction_ticket_categories.sql only granted the new permissions to
-- MANAGER/MARKETING/BOOKING/OPERATION/VIEWER, never re-running the blanket
-- cross-join 0003_rbac.sql used at the time SUPER_ADMIN was seeded. Additive
-- only: does not touch roles, permissions, or any existing role_permissions row.

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
cross join permissions p
where r.key = 'SUPER_ADMIN'
  and p.module = 'attraction_ticket'
on conflict do nothing;
