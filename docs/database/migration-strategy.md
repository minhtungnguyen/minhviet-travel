# Migration Strategy

## Current state (post Sprint 1B.1)

`database/migrations/0001`–`0013` were applied, in order, to the `mv-travel-os-dev` Supabase project (ref `otusjahkdjpxqayeeqqn`, ap-southeast-1) during Sprint 1B.1. This is the reduced, 13-file / 47-table baseline — the original Sprint 1A pass had 15 files / 77 tables; Sprint 1A.2 squashed and trimmed it (`docs/backend/sprint-1a2-reduction-report.md`) precisely because nothing had executed yet, so there was no migration history to preserve. `0013_notifications.sql` and `0014_integrations_registry.sql` were deleted outright (not deferred-in-place); the former `0015_audit.sql` was renamed to `0013_audit.sql`.

Two additional, small post-deploy hardening migrations were applied on top of the approved 13, per the Supabase security/performance advisor (not a schema/architecture change — see `docs/backend/sprint-1b1-database-deployment-report.md` for the full rationale):
- `0014_security_hardening_search_path_and_extension_schema` — fixed a mutable `search_path` on `set_updated_at()`/`forbid_mutation()` (the 3 RLS helper functions already had it) and moved the `citext` extension from `public` to `extensions` (matching where `pgcrypto`/`uuid-ossp` already live).
- `0015_performance_hardening_wrap_auth_uid_in_rls` — wrapped 7 `auth.uid()` comparisons in RLS policies as `(select auth.uid())`, the documented Supabase fix for per-row re-evaluation. Semantics-preserving; verified via the Phase 6 RLS test matrix both before and after.

Files are numbered sequentially (`0001`, `0002`, ...) rather than timestamped; Sprint 1B renames them to the Supabase CLI's `<timestamp>_<name>.sql` convention when first applying them — a mechanical rename, not a content change, since the ordering is already correct.

## Forward references

Three tables reference a table created by a *later* migration (`brands.logo_media_id`, `destinations.media_asset_id`, `user_profiles.avatar_media_id` → `media_assets`, created in `0008`; `cms_page_versions.seo_metadata_id` → `seo_metadata`, created in `0012`). The column is created nullable with no FK in the earlier migration, and the FK constraint is added via `ALTER TABLE` in the later migration once the target table exists — search for "Forward FKs deferred" in `0008_media.sql` and `0012_seo.sql` for the exact statements. This pattern is unchanged by the Sprint 1A.2 reduction; no new forward reference was introduced, and none was removed (the tables involved on both ends all survived).

## Fixed in Sprint 1A.2: `websites.domain` uniqueness

The original migration had both a column-level `unique` constraint on `domain` (permanent, ignores `deleted_at`) *and* a partial unique index intended to allow domain reuse after soft-delete — the blanket constraint silently defeated the partial index's purpose (`docs/backend/sprint-1a-architecture-review.md` §3.11). Fixed: `domain` uniqueness is now expressed as exactly one index, `websites_domain_active_unique on websites (lower(domain)) where deleted_at is null` — case-insensitive, active rows only. The same case-insensitive-slug treatment was applied to every other public-URL-bearing column that had an inline `unique(...)` constraint (`brands.slug`, `cms_pages.slug`, `faq_categories.slug`, `destination_translations.slug`, `seo_metadata.slug`, `forms.key`), converting each to an explicit `lower(...)`-based unique index.

## Local / dev (applied in Sprint 1B.1)

```
supabase init                          # once
supabase link --project-ref otusjahkdjpxqayeeqqn
supabase db push                       # applies database/migrations/0001-0013 in order
psql "$SUPABASE_DATABASE_URL" -f database/policies/0001_helper_functions.sql
psql "$SUPABASE_DATABASE_URL" -f database/policies/0002_public_content_policies.sql
psql "$SUPABASE_DATABASE_URL" -f database/policies/0003_internal_tables_policies.sql
psql "$SUPABASE_DATABASE_URL" -f database/seeds/0001_core_master_data.sql
# ...through database/seeds/0005_cms_navigation_forms_seo.sql, in order
```

Sprint 1B.1 applied the equivalent SQL directly via the Supabase MCP connection (`apply_migration` per file, `execute_sql` for seeds) rather than the CLI, since no local Supabase CLI session was set up in this pass — functionally identical, same files, same order, verified against actual database objects afterward (`docs/backend/sprint-1b1-database-deployment-report.md`). The CLI commands above remain the reference path for the next environment (staging).

(The Supabase CLI does not run arbitrary `database/policies`/`database/seeds` files automatically unless they're moved into `supabase/migrations` or referenced from `supabase/seed.sql` — a decision for whoever wires up staging; the ordering and idempotency of the SQL itself doesn't change either way.)

## Staging / production

- Each environment gets its own Supabase project (master-prompt §5 "Supabase project riêng cho production").
- Migrations are applied via CI (`supabase db push` against the target project) after review, never edited by hand against a live database (master-prompt §22: "Do not manually change production database schema outside migrations").
- Seed data (`database/seeds/`) runs against **local and staging only**. Production gets a hand-reviewed subset (the organization/brand/website/RBAC rows, not the example CMS page/form/nav placeholders) — master-prompt §21: "Do not seed real customer data."

## Rollback

Every migration in `0001`–`0013` is additive (new tables/columns/indexes/policies) — none drops or alters an existing column's type. A rollback is `DROP TABLE ... CASCADE` in reverse order for a migration that hasn't shipped data yet; once real data exists, prefer a forward-fixing migration over a destructive rollback (master-prompt §33: "For destructive database changes: Stop, Document the issue, Propose a safe migration").

## Re-introducing a deferred table

Every table dropped in Sprint 1A.2 (§3–§7 of `docs/backend/sprint-1a2-reduction-report.md`) returns as a **new migration file** (e.g. `0014_notifications.sql`) when its owning domain actually starts — never by resurrecting the old, now-deleted migration file. The old design (columns, indexes, RLS) is preserved in `docs/backend/sprint-1a-architecture-review.md` §1 as the reference to build from, so nothing has to be redesigned from scratch, but the SQL itself is written fresh against whatever the schema looks like at that point.

## Data migration rules

Any future migration that changes a column's meaning (not just adds one) must ship with an explicit backfill statement in the same migration file, not a follow-up script run manually — so `database/migrations/` remains a complete, replayable history of how the schema and its data reached the current state.
