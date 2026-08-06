-- 0024_ai_import.sql
-- Purpose: Sprint 7 Phase 7, AI Import schema. Targets the pipeline
-- contract already stubbed in Sprint 1
-- (integrations/ai/contracts/ai-import-provider.ts): source uploaded ->
-- ImportJob created -> parsing -> normalization -> validation -> draft
-- generated -> human review -> approval -> entity published.
--
-- `entity_type` is a free-text discriminator (e.g. 'tour'), not an enum —
-- the pipeline contract is deliberately entity-agnostic so a future
-- import target (hotels, MICE packages) reuses this same schema, matching
-- the contract file's own "whatever domain owns the target table" note.
-- Only Tour is a real consumer this sprint.
--
-- The uploaded source file itself is NOT duplicated into a new storage
-- column — `source_media_asset_id` points at the existing `media_assets`
-- table (uploaded PRIVATE, same Media Library infra every other file
-- upload in this codebase already goes through), so Storage/RLS/checksum
-- handling is reused verbatim, zero new upload code path.
--
-- Additive only. No DROP, no DELETE.

create type import_job_status as enum (
  'UPLOADED', 'PARSING', 'PARSED', 'VALIDATING', 'DRAFT_READY',
  'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED'
);

create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  entity_type text not null,
  source_media_asset_id uuid not null references media_assets(id) on delete restrict,
  status import_job_status not null default 'UPLOADED',
  error_message text,
  published_page_id uuid references cms_pages(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on import_jobs
  for each row execute function set_updated_at();
create index import_jobs_website_id_idx on import_jobs(website_id);
create index import_jobs_status_idx on import_jobs(status);
comment on table import_jobs is
  'One row per uploaded source file run through the AI Import pipeline (integrations/ai/contracts/ai-import-provider.ts). entity_type is a free-text discriminator, not an enum, so this schema is reusable beyond Tour.';

-- One draft per job for the MVP (re-running an import replaces it rather
-- than accumulating history) — matches the contract's ImportDraft type
-- 1:1 (`data` = the raw draft entity fields, `validation_errors` = the
-- flagged issues a human reviewer resolves before Approve).
create table import_drafts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references import_jobs(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on import_drafts
  for each row execute function set_updated_at();
comment on table import_drafts is
  'Extracted+normalized draft for one import_jobs row, pending human review before it becomes a real Tour Core draft (cms_pages).';
