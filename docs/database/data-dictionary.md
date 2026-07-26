# Data Dictionary — Sprint 1 (post Sprint 1A.2 reduction)

Exact column definitions, types, defaults and constraints live in `database/migrations/0001`–`0013` — that SQL is the authoritative source. This document explains the *business meaning* and *non-obvious design choices* per table. 47 active tables, reduced from an original 77 — every removed/merged/deferred table and the reasoning behind it is in `docs/backend/sprint-1a2-reduction-report.md`; this document only describes what's actually in the current migration set.

## 0003 / 0007 — Master data

- **currencies / languages / countries** — split into `0003_master_data_core.sql` (created early) purely because `organizations`/`websites` reference them; no semantic difference from the rest of master data.
- **provinces / cities** — administrative divisions, used for addresses (offices, organizations). Deliberately separate from `destinations`.
- **destinations / destination_translations** — a marketing/content hierarchy (Country → Region → Province/City → Destination → Attraction), self-referencing via `parent_destination_id`. Does not have to align 1:1 with administrative boundaries (e.g. "Vịnh Hạ Long" isn't an administrative unit). Every displayable string lives in `destination_translations`, one row per `(destination_id, locale)`. Slug uniqueness (`destination_translations_locale_slug_idx`) is `(locale, lower(slug))` — case-insensitive, matching the fix applied to every other public-URL-bearing slug in this schema.
- **product_types / customer_types** — plain admin-editable lookup tables, intentionally NOT enums, so adding a new value later is a data change (`INSERT`), not a migration. `transportation_types`/`supplier_types`/`units_of_measure`/`tax_categories`/`airports`/`harbors` were dropped from this migration in Sprint 1A.2 — none has a Sprint 1B consumer (no Flight/Cruise/Supplier/Pricing domain exists yet); each returns with its owning domain's own migration.

## 0004 — Organization

- **organizations** — one row per legal entity. `default_currency_code`/`default_language_code`/`default_timezone` are fallbacks a website/brand can override (see Settings).
- **brands** — `logo_media_id` has no FK until `0008_media.sql` runs (forward reference, documented in both files). `slug` uniqueness is global and case-insensitive (`brands_slug_idx on brands(lower(slug))`) — a deliberate single-organization-V1 simplification; revisit scoping to `(organization_id, slug)` once a second organization exists.
- **websites** — `domain` is `citext`. Uniqueness is **exactly one** rule: `websites_domain_active_unique on websites (lower(domain)) where deleted_at is null` — case-insensitive, active rows only, so a domain becomes reusable the moment its old website row is soft-deleted. (Sprint 1A.2 fix: the original design also had a column-level `unique` constraint that silently defeated this intent — see `docs/backend/sprint-1a-architecture-review.md` §3.11.) `seo_defaults`/`analytics_settings_ref`/`contact_settings_ref` are non-secret JSON only (master-prompt §8.1 explicit rule). `status` uses the 4-value `website_status` enum (`ACTIVE`/`PLANNED`/`INACTIVE`/`ARCHIVED`), not the generic 3-value `entity_status`, specifically so a not-yet-launched site (`vemaybay.minhviettravel.com`) has a distinct state from one that launched and was later retired.
- **business_units / offices / departments / positions** — a flexible internal org chart; `departments.parent_department_id` self-references for a department hierarchy, `departments.business_unit_id`/`office_id` are both optional.

## 0005 — Identity + RBAC

- **user_profiles.id** is not `gen_random_uuid()` — it's a direct FK to `auth.users.id`, enforcing the 1:1 relationship at the schema level (master-prompt §8.2).
- **`user_brand_memberships` was removed** in Sprint 1A.2 (`docs/backend/sprint-1a2-reduction-report.md` §3) — with exactly one brand in V1 it could never produce a different authorization outcome than organization membership. The V1 authorization model is `user_organization_memberships` + `user_website_access` + `user_roles` + `role_permissions`. `auth_user_website_ids()` (`database/policies/0001_helper_functions.sql`) now derives website access as: every website under every brand of every organization the user belongs to, UNION any explicit `user_website_access` grant.
- **role_scopes.scope_resource_id** is a bare `uuid` with no FK, because it can point at four different tables depending on `scope_level` — validated at the service layer. Schema kept, not yet enforced: with one active organization/brand/website, a scope check can only ever resolve to "organization-wide" today.
- **permissions.key** follows the dotted `module.entity.action` convention throughout; see `database/seeds/0003_rbac.sql` for the full Sprint 1 catalog (no `notifications.manage`/`integration.manage` keys — those modules have no active tables to gate).

## 0006 — Settings

- Two-table split (`setting_definitions` + `setting_values`) instead of one key-value table, to support typed values, secrecy flags, and per-scope resolution without ad-hoc string parsing.
- **`setting_value_history` was removed** in Sprint 1A.2 — it duplicated what `audit_logs` already records for every mutation. A settings write logs to `audit_logs` like any other mutation; there is no dedicated settings-history table.

## 0008 — Media

- `media_assets.storage_path` is a Supabase Storage object path, not a public URL — whether it's servable directly or needs a signed URL depends on `visibility`.
- **`brand_id` was removed** from both `media_folders` and `media_assets` in Sprint 1A.2 — it duplicated `website_id` → `brands.id` and could silently disagree with it. Brand-wide media (not tied to one website) uses `website_id IS NULL`.
- **`media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages` were removed** — no image-processing pipeline or admin media-library UI exists yet to use them.

## 0009 — CMS

- `cms_page_versions.is_current` (partial unique index: at most one `true` per `page_id`) replaces a circular `cms_pages.current_version_id` FK.
- `cms_pages`/`faq_categories`/`destination_translations` slugs are all case-insensitive unique (`lower(slug)`), matching the `websites.domain` fix.
- **`cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks` were removed** in Sprint 1A.2 (and `cms_page_versions.template_id` along with them) — a named-template-picker and cross-page reusable-block library both assume many pages needing an admin-selectable layout; today's page composition is hardcoded in React, with no dynamic template picker planned.
- `cms_blocks.config` is structured JSON, validated against a Zod schema per `block_definition_id` at the application layer.

## 0011 — Forms (fully redesigned in Sprint 1A.2)

The original `form_definitions`/`form_versions`/`form_fields`/`form_submission_values` EAV chain plus `form_routing_rules`/`form_notification_rules` modeled a dynamic, admin-configurable form builder nobody asked for. Replaced with exactly two tables:

- **`forms`** — a minimal catalog (`id`, `website_id`, `key`, `name`, `status`). A form's actual fields are defined in code (Zod + React), matching `lib/cms/schema.ts`'s existing pattern.
- **`form_submissions`** — every field the approved reduction decision named as operationally necessary is a first-class column, not buried in JSON: `organization_id` (denormalized alongside `website_id` specifically so org-wide reporting doesn't need a join — an intentional, approved exception to this schema's usual "no redundant ownership column" rule), `form_id`, `submission_type`, `status`, `full_name`, `phone`, `email`, `source_url`, `source_page_id`, `referrer`, `utm_source`/`utm_medium`/`utm_campaign`/`utm_content`/`utm_term`, `consent_marketing`, `consent_privacy`, `anonymous_session_id`, `idempotency_key` (unique where set — replaces the old `dedupe_key`), `submitted_at`, `processed_at`. Anything specific to one form's own fields goes in `payload jsonb`. Indexes are limited to named query patterns: `(website_id, status, submitted_at desc)` for a staff inbox, `(form_id, submitted_at desc)` for per-form reporting, `phone`/`email` for lookup/dedup, and the unique `idempotency_key` index for duplicate-submission protection.

No form routing, notification, or workflow table exists — assigning/notifying on a new submission is either handled inline in the submission route or deferred to CRM (Sprint 2).

## 0012 — SEO

- `seo_metadata` uses a polymorphic `(entity_type, entity_id)` pair rather than one nullable FK column per possible entity type — chosen because this table must attach to entity types that don't exist yet (tours, hotels, cruises).
- `seo_metadata_website_locale_slug_idx` is unique across ALL entity types within a website+locale, case-insensitive — a CMS page and a future tour can never claim the same public path.
- **New in Sprint 1A.2**: `seo_metadata_website_canonical_url_idx` — a partial unique index on `(website_id, lower(canonical_url))` where set, so no two entities on the same website can claim the same canonical URL.
- **`seo_schema_definitions`, `sitemap_entries`, `robots_rules` were removed** — verified directly against the codebase: `app/sitemap.ts` and `app/robots.ts` are working, code-based Next.js file-convention routes today, and `components/seo/json-ld.tsx` hand-builds JSON-LD per page type. None of the three reads from these tables, and nothing in Sprint 1B needs them to be DB-driven.

## 0013 — Audit (unchanged)

- `audit_logs`/`audit_log_changes`/`security_events` have no soft-delete column and no update path at all (enforced by the `forbid_mutation()` trigger from `0001`) — the only tables in the schema that are truly immutable once written. Renumbered from `0015` after the Notifications (old `0013`) and Integration Registry (old `0014`) migrations were removed entirely.

## Deferred modules — no active table, documented as extension points only

- **Notifications** (`notifications`, `notification_templates`, `notification_delivery_logs`) — no consumer creates a notification until CRM (Sprint 2) exists.
- **Integration Registry** (`integration_providers`, `integration_connections`, `integration_webhook_endpoints`, `integration_sync_logs`) — no real, credentialed integration is wired up yet. Connector contracts (`integrations/flight`, `integrations/attraction-ticket`, `integrations/email`, `integrations/ai`) still exist as TypeScript interfaces; only the SQL registry was removed.

Both return via their own migration once their trigger event exists — see `docs/architecture/future-travel-domains.md`.
