-- 0020_cms_page_version_metadata.sql
-- Purpose: Phase 4 CMS Operations V1 (docs/backend/admin-os/07-phase4-metadata-migration-preview.md).
-- Founder requires record metadata (created_by/updated_by/reviewed_by/
-- published_by + matching timestamps) tracked as first-class columns,
-- separate from audit_logs — audit_logs remains the append-only operation
-- history; these columns are the current-state pointer a record itself
-- carries (master-prompt distinction: audit trail vs. record metadata).
--
-- cms_pages already has created_at/updated_at/created_by/updated_by/deleted_at
-- (0009_cms.sql) — nothing added there. cms_page_versions is missing
-- updated_at/updated_by (no column, no trigger) and reviewed_by/reviewed_at/
-- published_by (published_at already exists, untouched). "Reviewed" maps to
-- the APPROVED transition (approve()) — the workflow has no separate
-- approved_at concept requested, so reviewed_by/reviewed_at is the record of
-- that step.
--
-- FK target: auth.users(id), matching the column already on this exact table
-- (cms_page_versions.created_by references auth.users(id)) and cms_pages'
-- created_by/updated_by — internal consistency within the Pages/News table
-- family, which is what "một chuẩn nhất quán cho cả Pages và News" requires
-- since News uses this same table. (0016_attraction_ticket_module.sql uses
-- user_profiles(id) for its own _by columns — a different module's existing
-- choice, not touched or extended here.)
--
-- No explicit ON DELETE clause, matching every sibling _by column across
-- cms_pages/cms_page_versions (defaults to NO ACTION) — no cascade/set-null
-- precedent exists in this schema for actor-reference columns, so this
-- migration does not introduce one.

alter table cms_page_versions
  add column updated_at timestamptz not null default now(),
  add column updated_by uuid references auth.users(id),
  add column reviewed_by uuid references auth.users(id),
  add column reviewed_at timestamptz,
  add column published_by uuid references auth.users(id);

create trigger set_updated_at before update on cms_page_versions
  for each row execute function set_updated_at();

-- Backfill: rows that predate this migration have no real "last updated by"
-- actor distinct from their creator, so updated_at/updated_by mirror
-- created_at/created_by rather than being left null. reviewed_by/reviewed_at/
-- published_by stay null for pre-existing APPROVED/PUBLISHED rows — no
-- reliable single actor to attribute retroactively without guessing from
-- audit_logs, which this migration deliberately does not do.
update cms_page_versions
set updated_at = created_at,
    updated_by = created_by
where updated_by is null;

-- Supports the manual Scheduler V1 due-item query (status = 'SCHEDULED' and
-- scheduled_publish_at <= now()) — the only new query pattern Phase 4 adds
-- against this table. No index added on the new *_by columns, matching the
-- existing schema-wide convention of never indexing actor-reference columns.
create index cms_page_versions_scheduled_due_idx
  on cms_page_versions (scheduled_publish_at)
  where status = 'SCHEDULED';
