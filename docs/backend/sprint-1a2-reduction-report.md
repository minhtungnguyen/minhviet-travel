# Sprint 1A.2 — Architecture Reduction and Consistency Repair Report

**Status:** Reduction applied and verified. Waiting for owner approval before Sprint 1B (Supabase project creation, migration execution) begins. No migration was executed and no Supabase project was created or connected to while producing this pass.

## Headline numbers

| | Count |
|---|---|
| Original verified table count (Sprint 1A, confirmed by direct count in `sprint-1a-architecture-review.md`) | **77** |
| Removed or merged permanently (§2) | 3 |
| Deferred to a later sprint, dropped from the active migration set entirely (§3) | 28 |
| Carried over unchanged from the 77 | 46 |
| New table introduced by this pass (§4) | 1 (`forms`) |
| **Final active Sprint 1B table count** | **47** |
| Migration files | 15 → **13** |

Reconciliation: `77 − 28 (deferred) − 3 (removed/merged) = 46` carried over, `+ 1` new (`forms`, a minimal catalog table the approved Forms decision explicitly allowed as an alternative to the removed `form_definitions`, which the original review's 46-table estimate hadn't separately counted) `= 47`. The 46→47 discrepancy against the architecture review's own estimate is deliberate and explained in §4, not a miscount.

---

## 1. What changed, by file

| File | Change |
|---|---|
| `0001_extensions_and_helpers.sql` | Unchanged |
| `0002_shared_enums.sql` | Removed `notification_channel`, `notification_priority`, `integration_status` (no remaining caller) |
| `0003_master_data_core.sql` | Unchanged |
| `0004_organization.sql` | Fixed `websites.domain` uniqueness (§5); added `brands_slug_idx on brands(lower(slug))` |
| `0005_identity_and_rbac.sql` | Removed `user_brand_memberships` (§2) |
| `0006_settings.sql` | Removed `setting_value_history` (§2) |
| `0007_master_data_extended.sql` | Removed `airports`, `harbors`, `transportation_types`, `supplier_types`, `units_of_measure`, `tax_categories` (§3); added case-insensitive slug index for `destination_translations` |
| `0008_media.sql` | Removed `brand_id` column from `media_folders`/`media_assets`; removed `media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages` (§3) |
| `0009_cms.sql` | Removed `cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks` and the `cms_page_versions.template_id` column (§3); added case-insensitive slug indexes for `cms_pages`/`faq_categories` |
| `0010_navigation.sql` | Unchanged |
| `0011_forms.sql` | Fully rewritten (§4) |
| `0012_seo.sql` | Removed `seo_schema_definitions`, `sitemap_entries`, `robots_rules` (§3); added case-insensitive slug index and a new canonical-URL dedup index for `seo_metadata` |
| `0013_notifications.sql` | **Deleted** (§3) |
| `0014_integrations_registry.sql` | **Deleted** (§3) |
| `0015_audit.sql` | Renamed to `0013_audit.sql`; content unchanged |

`database/policies/0001–0003` and `database/seeds/0001–0005` (`0006_integrations.sql` deleted) were updated to match. Full detail on the policy side in §6.

---

## 2. Removed or merged (3 tables)

| Table | Disposition |
|---|---|
| `user_brand_memberships` | Removed. With exactly one brand in V1, this table could never produce a different authorization outcome than `user_organization_memberships` already does. `auth_user_website_ids()` (`database/policies/0001_helper_functions.sql`) was rewritten: website access is now "every website under every brand of every organization the user belongs to, UNION any explicit `user_website_access` grant." The V1 authorization model is exactly the four tables named in the approved decision: `user_organization_memberships`, `user_website_access`, `user_roles`, `role_permissions`. |
| `setting_value_history` | Removed. It duplicated what `audit_logs` already records for every mutation. A settings write logs to `audit_logs` like any other mutation. |
| `form_submission_values` | Removed (see §4 — folded into `form_submissions.payload jsonb`). |

## 3. Deferred to a later sprint (28 tables, dropped from the active migration set)

None of these has a Sprint 1B consumer today; each returns via its own new migration (never a resurrected old file) when its owning domain starts.

| Group | Tables | Returns with |
|---|---|---|
| Extended master data | `airports`, `harbors`, `transportation_types`, `supplier_types`, `units_of_measure`, `tax_categories` | Flight, Cruise, Supplier, Pricing domains respectively |
| Media pipeline/library | `media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages` | Real image-processing pipeline or admin media-library UI |
| CMS templating | `cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks` | A real admin-selectable template picker (none planned; today's page composition is hardcoded React) |
| Dynamic form builder | `form_definitions`, `form_versions`, `form_fields`, `form_routing_rules`, `form_notification_rules` | An actual admin-configurable form builder (not requested; V1 forms are code-defined) |
| SEO extras duplicating working code | `seo_schema_definitions`, `sitemap_entries`, `robots_rules` | A concrete need to move `app/sitemap.ts`/`app/robots.ts`/`components/seo/json-ld.tsx` off code and onto the database (none identified) |
| Notifications | `notifications`, `notification_templates`, `notification_delivery_logs` | CRM (Sprint 2) — first event worth alerting someone about |
| Integration Registry | `integration_providers`, `integration_connections`, `integration_webhook_endpoints`, `integration_sync_logs` | The first real, credentialed, multi-connection integration |

## 4. Forms module — full redesign, not just a trim

The original `form_definitions`/`form_versions`/`form_fields`/`form_submission_values` EAV chain plus `form_routing_rules`/`form_notification_rules` is gone. Replaced with exactly two tables, per the approved decision:

- **`forms`** — a minimal catalog (`id`, `website_id`, `key` unique per website case-insensitively, `name`, `status`). This is the one net-new table this pass introduces (accounting for the 46→47 discrepancy against the architecture review's estimate, which assumed no catalog table at all, just a plain `form_key` text column). A `forms` row exists purely so `form_submissions.form_id` is a real, referentially-checked foreign key instead of an unvalidated free-text key — cheap insurance against a typo silently creating an orphaned submission bucket.
- **`form_submissions`** — every field the approved decision named as operationally necessary is a first-class column: `id`, `organization_id`, `website_id`, `form_id`, `submission_type`, `status`, `full_name`, `phone`, `email`, `source_url`, `source_page_id`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `consent_marketing`, `consent_privacy`, `anonymous_session_id`, `idempotency_key`, `payload`, `submitted_at`, `processed_at`, `created_at` (plus `updated_at`, added for consistency with every other mutable table in the schema — not in the decision's explicit list but not in conflict with it either). `organization_id` is a deliberate, approved denormalization (query convenience for reporting) — a documented exception to this schema's general "no redundant ownership column" rule.
- Indexes are limited to named query patterns only, per the approved decision: `(website_id, status, submitted_at desc)` for a staff inbox, `(form_id, submitted_at desc)` for per-form reporting, `phone`/`email` (partial, non-null) for lookup/dedup, and a unique partial index on `idempotency_key` for duplicate-submission protection.
- No form routing, notification, or workflow table exists in Sprint 1B, per the approved decision.

**Note for the owner:** the old `form_submissions.assigned_department_id` column (present in the original design) was also dropped along with `form_routing_rules`, since nothing computes it without a routing-rules table. If department assignment is needed before CRM exists, that's a one-column addition, not a redesign — flagged in `docs/playbooks/configure-form.md` rather than silently reintroduced here.

## 5. Constraint and RLS corrections

- **`websites.domain`** — the original migration had both a column-level `unique` constraint (permanent, ignores `deleted_at`) *and* a partial unique index intended to allow domain reuse after soft-delete; the blanket constraint silently defeated the partial index. Fixed to exactly the index specified in the approved decision: `create unique index websites_domain_active_unique on websites (lower(domain)) where deleted_at is null`.
- **Case-insensitive slug/key uniqueness applied consistently**, per the approved decision's ask to review whether other website-scoped slugs needed the same fix: `brands.slug` (global, `lower(slug)`), `cms_pages` (`website_id, locale, lower(slug)`), `faq_categories` (`website_id, lower(slug)`), `destination_translations` (`locale, lower(slug)`), `seo_metadata` (`website_id, locale, lower(slug)`), `forms` (`website_id, lower(key)`).
- **New: `seo_metadata_website_canonical_url_idx`** — a partial unique index on `(website_id, lower(canonical_url))` where set, so two entities on the same website can never claim the same canonical URL (the approved decision's "do not create duplicate canonical URLs across websites" requirement — enforced per-website, since canonical URLs across *different* websites are naturally distinct domains and don't need cross-website dedup).
- **`media_folders`/`media_assets.brand_id` removed** — duplicated `website_id → brands.id` and could silently disagree with it.
- **RLS**: `database/policies/0002_public_content_policies.sql` gained policies for `forms` and `cms_block_definitions` (the latter had been dropped when the old CMS-internal-config section was removed — caught by a 47-vs-46 cross-check against the migration set before this report was written, not left as a silent gap). `database/policies/0003_internal_tables_policies.sql` had every policy for a removed table deleted, and the master-data anon-read loop trimmed from 13 to 7 table names. Verified: **47 migrated tables, 47 RLS-enabled tables, exact match, zero stale references** (see §7).

## 6. Documentation and code synchronized

Every artifact listed in the approved decision was checked and, where stale, corrected:

- **Migrations, RLS, seeds** — rewritten as described above.
- **ERD** (`docs/database/erd.md`) — regenerated; entity count cross-checked against `create table` statements: **47 = 47, zero diff**.
- **Data dictionary** (`docs/database/data-dictionary.md`) — rewritten section by section to match.
- **RLS policy matrix** (`docs/database/rls-policy-matrix.md`) — rewritten; includes an explicit "tables with no RLS policy — because they don't exist" section listing all 31 removed/deferred tables.
- **Migration strategy** (`docs/database/migration-strategy.md`) — updated to describe the 13-file baseline, the `websites.domain` fix, and how a deferred table returns (new migration file, never a resurrected old one).
- **API docs** (`docs/api/sprint-1-endpoints.md`) — Notifications/Integrations rows removed from the target-surface table with an explicit "not in this list" section explaining why; Forms row updated to describe the code-defined-fields model.
- **TypeScript domain types / schemas / repositories / services** (`modules/organization`, `modules/access-control`) — searched directly; **no reference to `user_brand_memberships` or any other removed/deferred table existed in TypeScript code** (the two reference modules only ever touched tables in the 46-carried-over set). One stale comment was found and fixed: `integrations/flight/contracts/flight-provider.ts` referenced `integration_providers.key` as if the registry were active; corrected to describe it as deferred.
- **Architecture documentation** — `module-boundaries.md`, `multi-site-architecture.md`, `integration-connectors.md`, `future-travel-domains.md` all updated (removed-table references replaced with "deferred, returns when X" framing).
- **Playbooks** — `add-new-brand.md`, `add-new-website.md`, `add-future-api-provider.md` updated; `configure-form.md` fully rewritten for the new Forms model.
- **Security docs** — `secret-management.md` and `security-model.md` updated to describe the Integration Registry as deferred rather than active.
- **`docs/backend/sprint-1-implementation-report.md`** — corrected (55 → 77 → 47 table-count history) — see the updated file itself.

No documentation-only table and no undocumented active table remain — verified by direct cross-reference (§7), not asserted.

## 7. Verification method (not just "TypeScript builds")

Per the approved decision's explicit instruction not to claim database validity from a green TypeScript build, a static SQL consistency pass was run (scripts, not manual reading) before any `pnpm` command:

- **FK ordering**: every `references TABLE(...)` in every migration resolves to a table created in an equal-or-earlier file. Zero violations, beyond the two documented, intentional forward-reference patches (media, SEO), which use a nullable column + later `ALTER TABLE ADD CONSTRAINT`, not an inline reference.
- **Duplicate indexes / duplicate constraints**: scanned every `create index`/`create unique index` for identical `(table, columns, where-clause)` tuples, and every inline column-level `unique` for a co-existing separate unique index on the same column (the exact `websites.domain` bug pattern) — zero found post-fix.
- **Circular dependencies**: none — the only cross-references between "layers" are the two documented forward-reference patches, both one-directional.
- **Trigger references**: every table with an `updated_at` column has exactly one `set_updated_at` trigger attached, and vice versa — zero mismatches.
- **Duplicate table/enum/function definitions**: zero.
- **RLS coverage**: 47 migrated tables ↔ 47 RLS-enabled tables, exact match (cross-checked programmatically, including the 7-table dynamic-loop-enabled master data lookups, which a naive text search initially misses).
- **Permission-key consistency**: every permission key referenced by `auth_has_permission(...)` in any RLS policy is seeded in `database/seeds/0003_rbac.sql`; zero orphaned references. (Two seeded permissions, `cms.page.delete` and `master_data.manage`, have no *direct* RLS policy reference — `master_data.manage` is used via the dynamic-loop's escaped-quote string, invisible to a naive literal search but present; `cms.page.delete` is enforced only at the service layer, since the underlying RLS operation is the same `UPDATE` already gated by `cms.page.update` — not a gap.)
- **Seed UUID consistency**: every hardcoded seed UUID's occurrence count matches its expected number of references (e.g. the homepage `cms_pages` id appears exactly 4 times: create, `seo_metadata.entity_id`, `cms_page_versions.page_id`, `navigation_items.cms_page_id`).

### `pnpm` verification

```
pnpm exec tsc --noEmit   → 0 errors
pnpm lint                → 0 warnings, 0 errors
pnpm build               → succeeds, same 25 static + 3 dynamic routes as before this pass, no regressions
```

## 8. Remaining owner decisions

1. The 5 decisions raised in `sprint-1a-architecture-review.md` §10 are now resolved by this pass's approval — no longer open.
2. **New**: is `form_submissions.assigned_department_id` needed before CRM ships, given `form_routing_rules` (which would have computed it) is deferred? Currently dropped entirely (§4). Low cost to add back as a single nullable column if the answer is yes.
3. **New**: `brands.slug` uniqueness remains global (not per-organization) — a documented, low-priority simplification for single-organization V1, noted again here in case a second organization is imminent rather than hypothetical.
4. **New**: `role_scopes` remains schema-only, unenforced by `auth_has_permission()` — confirmed acceptable in the original review (§5) and unchanged by this pass; re-raised only so it isn't silently forgotten once a second website/brand makes scoping meaningful.

## 9. Remaining risks before creating a Supabase project

- All risks from `sprint-1a-architecture-review.md` §10 that concerned tables now removed/deferred no longer apply. The two risks that survive:
  - Loosening `form_submissions` to a real `form_id` FK (rather than the review's originally-envisioned plain `form_key` text) reduces but doesn't eliminate the referential-integrity trade-off — a `forms` row must exist before any submission can reference it, which is a small extra step (`database/seeds/0005_cms_navigation_forms_seo.sql` already models it for the `contact` form) but is a real constraint the old free-text design wouldn't have had.
  - Deferring `redirect_rules`/`slug_history` (kept, not removed) implementation to Sprint 1B means any slug change before then needs a manual `next.config.mjs` redirect — unchanged from the original review, restated here since it's still true.
- No new risk was introduced by this pass that wasn't already present in the schema it reduced.
