# Sprint 1B.1 — Pre-Migration Preflight Report

Static validation of the approved Sprint 1 architecture (`docs/backend/sprint-1a2-reduction-report.md`), performed before any SQL was executed against `mv-travel-os-dev`. Method: full manual read of all 21 SQL files (2,055 lines) plus grep-based cross-checks — not a re-assertion of the prior report's claims.

## Result: CLEAN — no inconsistency found. Proceeding to Phase 3.

## Checklist

| Check | Result |
|---|---|
| Active table count expected by approved architecture | **47** — recounted directly from `create table` statements: 0003(3) + 0004(7) + 0005(9) + 0006(2) + 0007(6) + 0008(2) + 0009(8) + 0010(2) + 0011(2) + 0012(3) + 0013(3) = 47. Matches `sprint-1a2-reduction-report.md` and `docs/database/erd.md`. |
| Migration file count | **13** (`0001`–`0013`), matches `database/migrations/`. |
| Migration execution order | `0001` → `0013`, dependency-ordered: extensions/helpers → shared enums → master-data-core → organization → identity/RBAC → settings → master-data-extended → media → CMS → navigation → forms → SEO → audit. |
| Every FK resolves to a table created equal-or-earlier | **Yes**, with exactly the 2 documented forward-reference patches (nullable column + later `ALTER TABLE ADD CONSTRAINT`, never an inline forward reference): `brands.logo_media_id` / `destinations.media_asset_id` / `user_profiles.avatar_media_id` → `media_assets` (patched in `0008`); `cms_page_versions.seo_metadata_id` → `seo_metadata` (patched in `0012`). Zero unintended violations. |
| SQL functions created before policy/trigger use | **Yes** — `set_updated_at()`/`forbid_mutation()` in `0001` (before any table migration); `auth_user_organization_ids()`/`auth_user_website_ids()`/`auth_has_permission()` in `policies/0001_helper_functions.sql` (applied before `policies/0002`, `0003`). |
| No circular FK dependency | **None.** Self-referencing FKs (`departments.parent_department_id`, `destinations.parent_destination_id`, `navigation_items.parent_item_id`, `employee_profiles.manager_id`) are single-table self-references, not cross-table cycles. |
| No duplicate constraints | **None** — grepped all named constraints/indexes across `database/migrations/*.sql`, zero names repeated. |
| No duplicate indexes | **None** — same grep pass, zero `(table, columns)` collisions. |
| No global uniqueness constraint conflicting with soft-delete partial index | **None.** `websites.domain` and `cms_pages.slug` each have exactly one partial unique index scoped `where deleted_at is null` (the Sprint 1A.2 fix), no co-existing blanket constraint. The one column-level `unique` on a soft-deletable table (`media_assets.storage_path`) is a system-generated Storage object path, not a human-chosen reusable identifier — not the same bug class, left as-is intentionally. |
| Every `updated_at` column has its trigger | **Yes**, 1:1, verified table-by-table against every migration file — including the negative case: tables that lack `updated_at` (`user_organization_memberships`, `permissions`, `cms_page_versions`, `cms_sections`, `slug_history`, `audit_*`) correctly have no `set_updated_at` trigger. |
| Every trigger references an existing function | **Yes** — `set_updated_at` and `forbid_mutation`, both defined in `0001` before first use. |
| Every RLS policy references existing columns/functions/permissions | **Yes**, spot-checked every policy in `policies/0002` and `policies/0003` against the migrated schema. |
| Every permission key referenced by RLS is seeded | **Yes** — 25 permission keys used across all RLS policies, all 25 present in `seeds/0003_rbac.sql`. `cms.page.delete` is seeded but has no direct RLS policy reference (enforced at the service layer via the same `UPDATE` already gated by `cms.page.update`) — a documented non-gap, not an orphan. |
| Seed dependency order valid | **Yes** — `0001` (master data: languages/currencies/countries/provinces/destinations/product & customer types) → `0002` (organization, needs `countries.VN` from `0001`) → `0003` (RBAC, no cross-file dependency) → `0004` (settings, needs org id from `0002`) → `0005` (CMS/nav/forms/SEO, needs website id from `0002`). |
| No deferred module table active | **Confirmed absent**: Notifications, Integration Registry, dynamic form builder, extended master data (airports/harbors/transportation_types/supplier_types/units_of_measure/tax_categories), media versioning/tagging, CMS templating, SEO extras (`seo_schema_definitions`/`sitemap_entries`/`robots_rules`). |
| No removed table referenced by SQL, code, or docs | **Confirmed** — grepped the entire repo for every removed/deferred table name. All hits are either (a) historical prose in `docs/backend/sprint-1a*.md` explaining what was removed and why, (b) SQL *comments* documenting the removal (e.g. `-- media_asset_versions ... were removed`), or (c) a doc-comment in `integrations/flight/contracts/flight-provider.ts` describing the Integration Registry as deferred. Zero actual `create`/`insert`/`alter`/`references`/`from`/`join` statements target a removed table anywhere in `database/`. |

## Scope confirmed for Phase 3

- 13 migrations (`database/migrations/0001`–`0013`)
- 3 policy files (`database/policies/0001`–`0003`)
- 5 seed files (`database/seeds/0001`–`0005`)

No correction was needed before proceeding.
