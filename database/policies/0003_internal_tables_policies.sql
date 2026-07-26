-- 0003_internal_tables_policies.sql
-- Purpose: RLS for tables that are never rendered directly on the public
-- website. Default posture per table family is documented in
-- docs/database/rls-policy-matrix.md; this file is the SQL for it.
--
-- Sprint 1A.2 reduction: removed every policy for tables dropped in this
-- pass (user_brand_memberships; setting_value_history; the 6 deferred
-- extended-master-data lookups; media_asset_versions/media_tags/
-- media_asset_tag_mappings/media_usages; cms_templates/
-- cms_page_template_mappings/reusable_content_blocks; form_definitions/
-- form_versions/form_fields/form_routing_rules/form_notification_rules/
-- form_submission_values; seo_schema_definitions/sitemap_entries/
-- robots_rules; the entire notifications and integration-registry
-- modules) — see docs/backend/sprint-1a2-reduction-report.md for the
-- full accounting. `form_submissions` gets a fresh policy set matching
-- its new, simplified shape.

-- Identity: a user can always read/update their own profile ---------------
alter table user_profiles enable row level security;
create policy "self_read_profile" on user_profiles
  for select to authenticated using (id = auth.uid());
create policy "self_update_profile" on user_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "staff_read_all_profiles" on user_profiles
  for select to authenticated using (auth_has_permission('user.manage'));
create policy "staff_write_all_profiles" on user_profiles
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

alter table employee_profiles enable row level security;
create policy "self_read_employee_profile" on employee_profiles
  for select to authenticated
  using (user_profile_id = auth.uid() or auth_has_permission('user.manage'));
create policy "staff_write_employee_profiles" on employee_profiles
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

-- Membership/access tables: readable by the user themself + user.manage ---
-- (user_brand_memberships removed — see file header)
alter table user_organization_memberships enable row level security;
alter table user_website_access enable row level security;

create policy "self_read_org_membership" on user_organization_memberships
  for select to authenticated
  using (user_profile_id = auth.uid() or auth_has_permission('user.manage'));
create policy "staff_write_org_membership" on user_organization_memberships
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

create policy "self_read_website_access" on user_website_access
  for select to authenticated
  using (user_profile_id = auth.uid() or auth_has_permission('user.manage'));
create policy "staff_write_website_access" on user_website_access
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

-- RBAC: permission keys are not secret, any authenticated staff member ----
-- can read the catalog; only role.manage can change it.
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;
alter table role_scopes enable row level security;

create policy "staff_read_roles" on roles for select to authenticated using (true);
create policy "staff_write_roles" on roles
  for all to authenticated
  using (auth_has_permission('role.manage')) with check (auth_has_permission('role.manage'));

create policy "staff_read_permissions" on permissions for select to authenticated using (true);
create policy "staff_write_permissions" on permissions
  for all to authenticated
  using (auth_has_permission('role.manage')) with check (auth_has_permission('role.manage'));

create policy "staff_read_role_permissions" on role_permissions for select to authenticated using (true);
create policy "staff_write_role_permissions" on role_permissions
  for all to authenticated
  using (auth_has_permission('role.manage')) with check (auth_has_permission('role.manage'));

create policy "self_read_user_roles" on user_roles
  for select to authenticated
  using (user_profile_id = auth.uid() or auth_has_permission('user.manage'));
create policy "staff_write_user_roles" on user_roles
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

create policy "self_read_role_scopes" on role_scopes
  for select to authenticated
  using (
    exists (select 1 from user_roles ur where ur.id = role_scopes.user_role_id and ur.user_profile_id = auth.uid())
    or auth_has_permission('user.manage')
  );
create policy "staff_write_role_scopes" on role_scopes
  for all to authenticated
  using (auth_has_permission('user.manage')) with check (auth_has_permission('user.manage'));

-- Organization hierarchy: readable by members of the organization ---------
alter table organizations enable row level security;
alter table brands enable row level security;
alter table business_units enable row level security;
alter table offices enable row level security;
alter table departments enable row level security;
alter table positions enable row level security;

create policy "member_read_organization" on organizations
  for select to authenticated using (id in (select auth_user_organization_ids()));
create policy "staff_write_organization" on organizations
  for all to authenticated
  using (auth_has_permission('settings.organization.update'))
  with check (auth_has_permission('settings.organization.update'));

create policy "member_read_brands" on brands
  for select to authenticated using (organization_id in (select auth_user_organization_ids()));
create policy "staff_write_brands" on brands
  for all to authenticated
  using (auth_has_permission('settings.brand.update'))
  with check (auth_has_permission('settings.brand.update'));

create policy "member_read_business_units" on business_units
  for select to authenticated using (organization_id in (select auth_user_organization_ids()));
create policy "staff_write_business_units" on business_units
  for all to authenticated
  using (auth_has_permission('settings.organization.update'))
  with check (auth_has_permission('settings.organization.update'));

create policy "member_read_offices" on offices
  for select to authenticated using (organization_id in (select auth_user_organization_ids()));
create policy "staff_write_offices" on offices
  for all to authenticated
  using (auth_has_permission('settings.organization.update'))
  with check (auth_has_permission('settings.organization.update'));

create policy "member_read_departments" on departments
  for select to authenticated using (organization_id in (select auth_user_organization_ids()));
create policy "staff_write_departments" on departments
  for all to authenticated
  using (auth_has_permission('settings.organization.update'))
  with check (auth_has_permission('settings.organization.update'));

create policy "member_read_positions" on positions
  for select to authenticated
  using (exists (
    select 1 from departments d where d.id = positions.department_id
    and d.organization_id in (select auth_user_organization_ids())
  ));
create policy "staff_write_positions" on positions
  for all to authenticated
  using (auth_has_permission('settings.organization.update'))
  with check (auth_has_permission('settings.organization.update'));

-- Master data lookups: harmless reference data, world-readable ------------
-- (docs/database/rls-policy-matrix.md explains why these are the
-- documented exception to "gate everything behind a permission". Reduced
-- to the 2 tables that survived Sprint 1A.2 — airports/harbors/
-- transportation_types/supplier_types/units_of_measure/tax_categories
-- were dropped entirely, not just left ungated.)
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'currencies', 'languages', 'countries', 'provinces', 'cities',
    'product_types', 'customer_types'
  ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "public_read_%1$s" on %1$s for select to anon, authenticated using (true);', t
    );
    execute format(
      'create policy "staff_write_%1$s" on %1$s for all to authenticated using (auth_has_permission(''master_data.manage'')) with check (auth_has_permission(''master_data.manage''));',
      t
    );
  end loop;
end $$;

-- Settings -----------------------------------------------------------------
alter table setting_definitions enable row level security;
alter table setting_values enable row level security;

create policy "staff_read_setting_definitions" on setting_definitions
  for select to authenticated using (true);
create policy "staff_write_setting_definitions" on setting_definitions
  for all to authenticated
  using (auth_has_permission('settings.definition.manage'))
  with check (auth_has_permission('settings.definition.manage'));

create policy "public_read_public_setting_values" on setting_values
  for select to anon, authenticated
  using (exists (
    select 1 from setting_definitions sd
    where sd.id = setting_values.setting_definition_id and sd.visibility = 'PUBLIC'
  ));
create policy "staff_read_all_setting_values" on setting_values
  for select to authenticated using (auth_has_permission('settings.website.update'));
create policy "staff_write_setting_values" on setting_values
  for all to authenticated
  using (auth_has_permission('settings.website.update'))
  with check (auth_has_permission('settings.website.update') and
    -- is_secret definitions may never be written through this table —
    -- enforced here, not just documented (master-prompt §8.4).
    not exists (
      select 1 from setting_definitions sd
      where sd.id = setting_values.setting_definition_id and sd.is_secret
    ));
-- No setting_value_history policies — the table was removed; a settings
-- write logs to audit_logs like any other mutation (see 0006_settings.sql).

-- Media (internal tables only; media_assets policy is in 0002) ------------
alter table media_folders enable row level security;

create policy "staff_read_media_folders" on media_folders for select to authenticated using (auth_has_permission('media.asset.read'));
create policy "staff_write_media_folders" on media_folders for all to authenticated
  using (auth_has_permission('media.asset.upload')) with check (auth_has_permission('media.asset.upload'));
-- media_asset_versions / media_tags / media_asset_tag_mappings / media_usages
-- were removed — no policies needed.

-- CMS internal config tables ------------------------------------------------
-- cms_templates / cms_page_template_mappings / reusable_content_blocks were
-- removed. cms_block_definitions is public-readable (policy lives in
-- 0002_public_content_policies.sql alongside the other CMS content tables
-- it types) — nothing internal-only remains for the CMS module here.

-- Forms: structure is public-readable (policy in 0002); submissions are not.
alter table form_submissions enable row level security;

-- Deliberately NO anon insert policy (master-prompt §12: "Do not allow
-- unrestricted public inserts directly into complex application tables").
-- Public form submission goes through a server route using the service
-- role, which bypasses RLS after Zod validation + honeypot/rate-limit
-- checks — see docs/api/api-conventions.md and modules/forms/application.
create policy "staff_read_form_submissions" on form_submissions
  for select to authenticated using (auth_has_permission('forms.submission.read'));
create policy "staff_update_form_submissions" on form_submissions
  for update to authenticated
  using (auth_has_permission('forms.submission.read')) with check (auth_has_permission('forms.submission.read'));
-- form_routing_rules / form_notification_rules / form_submission_values
-- were removed — no policies needed.

-- SEO extras: redirect_rules is the only "extra" table that survived ------
-- (seo_schema_definitions / sitemap_entries / robots_rules were removed —
-- see 0012_seo.sql; slug_history keeps its policy below, unchanged.)
alter table redirect_rules enable row level security;
alter table slug_history enable row level security;

create policy "public_read_active_redirects" on redirect_rules for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_redirects" on redirect_rules for all to authenticated
  using (auth_has_permission('seo.redirect.update')) with check (auth_has_permission('seo.redirect.update'));

create policy "staff_read_slug_history" on slug_history for select to authenticated using (auth_has_permission('seo.metadata.update'));

-- Notifications module and Integration Registry module were removed
-- entirely (docs/backend/sprint-1a2-reduction-report.md §5/§6) — no
-- tables, no policies. They return together with their first real
-- consumer (CRM for notifications; the first live provider for
-- integrations).

-- Audit / security: RLS enabled, no anon policy, staff get SELECT only ----
-- (write access is via the service role from the server-side audit
-- logger only — see shared/auth + modules/audit/application; the
-- forbid_mutation trigger from 0001 blocks UPDATE/DELETE regardless of role).
alter table audit_logs enable row level security;
alter table audit_log_changes enable row level security;
alter table security_events enable row level security;

create policy "staff_read_audit_logs" on audit_logs for select to authenticated using (auth_has_permission('audit.read'));
create policy "staff_read_audit_log_changes" on audit_log_changes for select to authenticated using (auth_has_permission('audit.read'));
create policy "staff_read_security_events" on security_events for select to authenticated using (auth_has_permission('audit.read'));
