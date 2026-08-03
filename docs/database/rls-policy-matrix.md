# RLS Policy Matrix — Sprint 1 (post Sprint 1A.2 reduction)

Source of truth is the SQL in `database/policies/`; this document explains the *reasoning* per table family.

> **Status update (Phase 0 audit, `docs/backend/auth/01-current-state-audit.md`):** the line below originally read "Not yet applied to any project" — that was true at Sprint 1A authoring time but is **stale**. Re-verified live against `mv-travel-os-dev` (`otusjahkdjpxqayeeqqn`) via Supabase MCP: all policies described here **are applied**, and the table count has grown to 62 (47 Sprint 1 tables + 15 added by the Attraction Ticket module in Sprint "mv-ticket") — every one of the 62 has RLS **enabled**, confirmed via `list_tables`, not assumed from migration files. The per-table reasoning below is otherwise still accurate and is the correct reference to build against.

47 tables total from the original Sprint 1 scope — every one has RLS **enabled**, with zero documented exceptions (master-prompt §12).

Legend: **anon** = unauthenticated public visitor. **auth (self)** = any authenticated user, own rows only. **staff (perm)** = authenticated user holding the named permission key.

## Public website content (`database/policies/0002_public_content_policies.sql`)

| Table | anon read | staff read (any) | write |
|---|---|---|---|
| `websites` | `status='ACTIVE' and deleted_at is null` | `settings.website.read` or explicit website access | `settings.website.update` |
| `cms_pages` | has a published+current version, not deleted | `cms.page.read` | `cms.page.create`/`cms.page.update` |
| `cms_page_versions` | `is_current and status='PUBLISHED'` | `cms.page.read` | `cms.page.update`; publishing needs `cms.page.publish` |
| `cms_sections`, `cms_blocks` | parent version is published+current | via parent page | `cms.page.update` |
| `cms_block_definitions` | `status='ACTIVE'` | — | `cms.template.manage` |
| `navigation_menus`, `navigation_items` | `status='ACTIVE'` | same | `cms.navigation.update` |
| `faq_categories`, `faqs` | `status='ACTIVE'` | same | `cms.faq.update` |
| `announcements` | `ACTIVE` and inside `[starts_at, ends_at]` window | same | `cms.announcement.update` |
| `seo_metadata` | all rows (meant to render publicly) | — | `seo.metadata.update` |
| `destinations`, `destination_translations` | `status='ACTIVE' and deleted_at is null` | same | `master_data.destination.update` |
| `forms` | `status='ACTIVE'` (catalog only — needed to render a form) | — | `forms.definition.manage` |
| `media_assets` | `visibility='PUBLIC' and deleted_at is null` only | `media.asset.read` for the rest | `media.asset.upload` |

## Internal-only tables (`database/policies/0003_internal_tables_policies.sql`)

| Table family | Read | Write |
|---|---|---|
| `user_profiles`, `employee_profiles` | self, or `user.manage` | self (own profile) or `user.manage` |
| `user_organization_memberships`, `user_website_access` | self, or `user.manage` | `user.manage` |
| `roles`, `permissions`, `role_permissions` | any authenticated (not secret) | `role.manage` |
| `user_roles`, `role_scopes` | self, or `user.manage` | `user.manage` |
| `organizations`, `brands`, `business_units`, `offices`, `departments`, `positions` | members of the organization (`auth_user_organization_ids()`) | `settings.organization.update` / `settings.brand.update` |
| Master data lookups (`currencies`, `languages`, `countries`, `provinces`, `cities`, `product_types`, `customer_types`) | **anon + authenticated** (documented exception — harmless reference data) | `master_data.manage` |
| `setting_definitions` | any authenticated, **plus anon when `visibility='PUBLIC'`** (`public_read_public_setting_definitions`, added Sprint 2 — the matching `setting_values` anon policy below existed already but could never actually resolve true for anon without this, since its own `EXISTS` subquery against `setting_definitions` was itself blocked) | `settings.definition.manage` |
| `setting_values` | anon only if the definition is `visibility='PUBLIC'`; staff need `settings.website.update` | `settings.website.update`, and the write policy's `WITH CHECK` blocks writing a value for any `is_secret` definition outright |
| `media_folders` | `media.asset.read` | `media.asset.upload` |
| `form_submissions` | **no anon policy at all** — see below | staff `forms.submission.read`; inserts only via service role from a server route |
| `redirect_rules` | anon+authenticated, `status='ACTIVE'` only | `seo.redirect.update` |
| `slug_history` | `seo.metadata.update` | none (service-layer insert only) |
| `audit_logs`, `audit_log_changes`, `security_events` | `audit.read` only, **no anon, no write policy of any kind** | none — the `forbid_mutation()` trigger blocks UPDATE/DELETE even for a role that somehow got a grant; inserts happen exclusively via the server-side audit logger using the service role |

## Tables with no RLS policy — because they don't exist

Removed entirely in Sprint 1A.2 (no migration, so no RLS to write): `user_brand_memberships`, `setting_value_history`, `airports`, `harbors`, `transportation_types`, `supplier_types`, `units_of_measure`, `tax_categories`, `media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages`, `cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks`, `form_definitions`, `form_versions`, `form_fields`, `form_routing_rules`, `form_notification_rules`, `form_submission_values`, `seo_schema_definitions`, `sitemap_entries`, `robots_rules`, `notifications`, `notification_templates`, `notification_delivery_logs`, `integration_providers`, `integration_connections`, `integration_webhook_endpoints`, `integration_sync_logs`. Full accounting: `docs/backend/sprint-1a2-reduction-report.md`.

## Why form submissions have no public INSERT policy

Master-prompt §12 explicitly warns: *"Do not allow unrestricted public inserts directly into complex application tables."* `form_submissions` is a rich, multi-field write that needs Zod validation, consent checks, and idempotency-key computation *before* anything is written — none of which RLS can express. The public-facing server route calls Supabase with the **service role** key after all of that runs, the same pattern `lib/actions/lead-action.ts` already uses today. This holds after the Sprint 1A.2 forms simplification exactly as it did before — the posture didn't change, only the table shape did.

## Verified coverage

Every one of the 47 tables in `database/migrations/` has a matching `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in `database/policies/` (the 7 master-data lookup tables via the dynamic `DO $$ ... EXECUTE format(...) $$` loop in `0003_internal_tables_policies.sql`, not literal per-table statements) — cross-checked directly against migration output, not assumed.

## Known gap, deliberately deferred

`websites.analytics_settings_ref`/`contact_settings_ref` are non-secret JSON but readable as part of the whole `websites` row once `status='ACTIVE'` — Postgres RLS is row-level, not column-level. Deferred until a concrete field needs hiding (master-prompt §36 principle 19: don't over-engineer for a need that doesn't exist yet).
