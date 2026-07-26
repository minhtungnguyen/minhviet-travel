-- 0002_shared_enums.sql
-- Purpose: enum types shared across two or more modules. Module-specific
-- enums (e.g. cms_page_type) are created in that module's own migration
-- file, next to the tables that use them, per docs/database/data-dictionary.md.
--
-- Per master-prompt §10: "Use database enums only when stability is
-- expected." Every enum below is a fixed, small, rarely-changing
-- vocabulary (master-prompt §20). Anything an admin should be able to
-- reconfigure without a migration (e.g. product types, supplier types)
-- is a lookup TABLE instead — see 0007_master_data_extended.sql.
--
-- Sprint 1A.2 reduction: `notification_channel`, `notification_priority`
-- and `integration_status` were removed here — they had no remaining
-- caller once the Notifications and Integration Registry modules were
-- deferred entirely (docs/backend/sprint-1a2-reduction-report.md). They
-- return with those modules' own migration when a real trigger event
-- (CRM, first live integration) exists.

create type entity_status as enum ('ACTIVE', 'INACTIVE', 'ARCHIVED');
comment on type entity_status is 'Generic lifecycle status (master-prompt §20) for simple lookup/config entities.';

create type website_status as enum ('ACTIVE', 'PLANNED', 'INACTIVE', 'ARCHIVED');
comment on type website_status is 'PLANNED = record exists (e.g. vemaybay.minhviettravel.com) but not yet publicly live.';

create type account_status as enum ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'TERMINATED');

create type cms_lifecycle_status as enum ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

create type form_submission_status as enum ('NEW', 'VALIDATED', 'PROCESSED', 'REJECTED', 'SPAM');

create type redirect_kind as enum ('301', '302');

create type media_visibility as enum ('PUBLIC', 'PRIVATE');

create type permission_scope_level as enum (
  'ORGANIZATION', 'BRAND', 'WEBSITE', 'BUSINESS_UNIT', 'OWN', 'ASSIGNED', 'ALL'
);
comment on type permission_scope_level is 'Master-prompt §8.3 scope vocabulary for role_scopes (schema kept, not yet enforced — see rls-policy-matrix.md).';
