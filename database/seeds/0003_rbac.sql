-- 0003_rbac.sql
-- The fixed 8 roles (sprint-1-implementation-plan.md §1.2) and the full
-- Sprint 1 permission catalog (every key referenced anywhere in
-- database/policies/ and modules/*/application). Role -> permission
-- mappings below are a reasonable operational default, not a business
-- requirement handed down by any spec — revisit via
-- docs/playbooks/add-new-role.md once real usage shows a role needs more
-- or less than this.

insert into roles (key, name, description, is_system, status) values
  ('SUPER_ADMIN', 'Super Admin', 'Full platform access, including role management.', true, 'ACTIVE'),
  ('ADMIN', 'Admin', 'Full operational access.', true, 'ACTIVE'),
  ('MANAGER', 'Manager', 'Manages content, forms, SEO and master data across the organization.', false, 'ACTIVE'),
  ('SALES', 'Sales', 'Handles inbound leads and booking requests.', false, 'ACTIVE'),
  ('BOOKING', 'Booking', 'Processes confirmed booking requests.', false, 'ACTIVE'),
  ('OPERATION', 'Operation', 'Coordinates supplier and product operations.', false, 'ACTIVE'),
  ('MARKETING', 'Marketing', 'Manages CMS content, SEO and campaign forms.', false, 'ACTIVE'),
  ('VIEWER', 'Viewer', 'Read-only access for reporting and oversight.', false, 'ACTIVE')
on conflict (key) do update set name = excluded.name, description = excluded.description;

insert into permissions (key, module, action, description) values
  ('cms.page.read', 'cms', 'read', 'View CMS pages including drafts'),
  ('cms.page.create', 'cms', 'create', 'Create CMS pages'),
  ('cms.page.update', 'cms', 'update', 'Edit CMS pages, sections and blocks'),
  ('cms.page.delete', 'cms', 'delete', 'Soft-delete CMS pages'),
  ('cms.page.publish', 'cms', 'publish', 'Publish or schedule a CMS page version'),
  ('cms.navigation.update', 'cms', 'update', 'Edit navigation menus and items'),
  ('cms.faq.update', 'cms', 'update', 'Edit FAQ categories and entries'),
  ('cms.announcement.update', 'cms', 'update', 'Edit announcement bar content'),
  ('cms.template.manage', 'cms', 'manage', 'Manage CMS block definitions (the catalog of block types pages can use)'),
  ('media.asset.upload', 'media', 'upload', 'Upload and manage media assets'),
  ('media.asset.read', 'media', 'read', 'View the full media library, including private assets'),
  ('settings.website.read', 'settings', 'read', 'View website configuration'),
  ('settings.website.update', 'settings', 'update', 'Edit website configuration'),
  ('settings.organization.update', 'settings', 'update', 'Edit organization, office and department records'),
  ('settings.brand.update', 'settings', 'update', 'Edit brand records'),
  ('settings.definition.manage', 'settings', 'manage', 'Create/edit setting definitions'),
  ('master_data.manage', 'master_data', 'manage', 'Edit master data lookups (currencies, product types, ...)'),
  ('master_data.destination.update', 'master_data', 'update', 'Edit destinations and translations'),
  ('forms.definition.manage', 'forms', 'manage', 'Create/edit form catalog entries (forms table)'),
  ('forms.submission.read', 'forms', 'read', 'View and process form submissions'),
  ('seo.metadata.update', 'seo', 'update', 'Edit SEO metadata'),
  ('seo.redirect.update', 'seo', 'update', 'Manage redirect rules'),
  ('audit.read', 'audit', 'read', 'View audit logs and security events'),
  ('user.manage', 'user', 'manage', 'Manage user accounts, memberships and role assignments'),
  ('role.manage', 'role', 'manage', 'Manage roles and permission catalog')
on conflict (key) do update set description = excluded.description;

-- SUPER_ADMIN: every permission.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.key = 'SUPER_ADMIN'
on conflict do nothing;

-- ADMIN: every permission.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.key = 'ADMIN'
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'MANAGER' and p.key = any(array[
  'cms.page.read', 'cms.page.create', 'cms.page.update', 'cms.page.publish',
  'cms.navigation.update', 'cms.faq.update', 'cms.announcement.update',
  'media.asset.upload', 'media.asset.read',
  'settings.website.read', 'master_data.manage', 'master_data.destination.update',
  'forms.definition.manage', 'forms.submission.read',
  'seo.metadata.update', 'seo.redirect.update', 'audit.read'
])
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'SALES' and p.key = any(array['cms.page.read', 'forms.submission.read', 'settings.website.read'])
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'BOOKING' and p.key = any(array['cms.page.read', 'forms.submission.read'])
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'OPERATION' and p.key = any(array['cms.page.read', 'forms.submission.read', 'master_data.manage'])
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'MARKETING' and p.key = any(array[
  'cms.page.read', 'cms.page.create', 'cms.page.update', 'cms.page.publish',
  'cms.navigation.update', 'cms.faq.update', 'cms.announcement.update',
  'media.asset.upload', 'media.asset.read',
  'seo.metadata.update', 'seo.redirect.update',
  'forms.definition.manage', 'forms.submission.read'
])
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key = 'VIEWER' and p.key = any(array['cms.page.read', 'forms.submission.read', 'settings.website.read'])
on conflict do nothing;
