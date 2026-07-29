-- 0006_attraction_ticket.sql
-- Purpose: permission catalog entries for the Attraction Ticket module
-- (database/migrations/0016_attraction_ticket_module.sql,
-- database/policies/0004_attraction_ticket_policies.sql). Follows the same
-- upsert-safe shape as 0003_rbac.sql. SUPER_ADMIN and ADMIN already receive
-- every permission via their existing cross-join inserts in 0003_rbac.sql —
-- not repeated here.

insert into permissions (key, module, action, description) values
  ('attraction_ticket.venue.write', 'attraction_ticket', 'update', 'Create/edit attraction venues and translations'),
  ('attraction_ticket.product.write', 'attraction_ticket', 'update', 'Create/edit ticket products and translations'),
  ('attraction_ticket.content.publish', 'attraction_ticket', 'publish', 'Edit/publish FAQ and cross-sell content for ticket products'),
  ('attraction_ticket.booking.read', 'attraction_ticket', 'read', 'View attraction ticket bookings and vouchers'),
  ('attraction_ticket.booking.cancel', 'attraction_ticket', 'update', 'Cancel an attraction ticket booking'),
  ('attraction_ticket.sync.trigger', 'attraction_ticket', 'manage', 'Trigger a manual provider sync and edit provider references'),
  ('attraction_ticket.sync.read', 'attraction_ticket', 'read', 'View provider sync logs and API error logs')
on conflict (key) do update set description = excluded.description;

-- MANAGER: same "manages content + master data across the organization"
-- scope as its existing CMS/master-data grants in 0003_rbac.sql.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'MANAGER' and p.key = any(array[
  'attraction_ticket.venue.write', 'attraction_ticket.product.write', 'attraction_ticket.content.publish',
  'attraction_ticket.booking.read', 'attraction_ticket.booking.cancel',
  'attraction_ticket.sync.trigger', 'attraction_ticket.sync.read'
])
on conflict do nothing;

-- MARKETING: content only, matching its existing CMS-content-only scope
-- (no booking/sync — those are operational, not editorial).
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'MARKETING' and p.key = any(array[
  'attraction_ticket.venue.write', 'attraction_ticket.product.write', 'attraction_ticket.content.publish'
])
on conflict do nothing;

-- BOOKING: "processes confirmed booking requests" — matches its role
-- description in 0003_rbac.sql exactly.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'BOOKING' and p.key = any(array['attraction_ticket.booking.read', 'attraction_ticket.booking.cancel'])
on conflict do nothing;

-- OPERATION: "coordinates supplier and product operations" — sync/product
-- operational work, not customer-facing booking data.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'OPERATION' and p.key = any(array[
  'attraction_ticket.venue.write', 'attraction_ticket.product.write',
  'attraction_ticket.sync.trigger', 'attraction_ticket.sync.read'
])
on conflict do nothing;

-- VIEWER: read-only oversight, matching its existing scope.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'VIEWER' and p.key = any(array['attraction_ticket.booking.read', 'attraction_ticket.sync.read'])
on conflict do nothing;
