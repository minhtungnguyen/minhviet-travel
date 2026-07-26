# Sprint 1A.1 — Architecture Review and Scope Reduction

**Status:** Review only. No migration, policy, seed, or module code was modified while producing this document. Waiting for owner approval before any reduction is applied.

**Correction up front:** `docs/backend/sprint-1-implementation-report.md` stated the schema has "55 tables." That was wrong — a direct count of every `create table` statement in `database/migrations/0001`–`0015` gives **77 tables**, confirmed against the ERD (`docs/database/erd.md`, which does document all 77 correctly). This review works from the verified count of 77 throughout; the implementation report needs a one-line fix once this pass is approved (see §9).

---

## 1. Complete table inventory (77 tables)

Legend for the two scope columns: **Org** = organization-scoped, **Brand** = brand-scoped, **Site** = website-scoped. "—" means the table is global (no such scope applies, by design — see §4 for why that's correct rather than an omission).

### Master data (core) — `0003_master_data_core.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `currencies` | ISO currency lookup | referenced by `organizations`, `websites` | —/—/— | anon-readable lookup | `organizations.default_currency_code`, `websites.default_currency_code` FKs | **Yes** |
| `languages` | Locale lookup | referenced by `organizations`, `websites`, `destination_translations`, `user_profiles.locale`, CMS/forms/faq locale columns | —/—/— | anon-readable lookup | every locale-bearing FK across the schema | **Yes** |
| `countries` | Country lookup | referenced by `organizations`, `offices`, `destinations`, `airports`, `harbors` | —/—/— | anon-readable lookup | address fields, destination hierarchy root | **Yes** |

### Organization hierarchy — `0004_organization.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `organizations` | The legal entity (Minh Việt Travel) | root of `brands`, `business_units`, `offices`, `departments` | self | member-read, `settings.organization.update` write | `OrganizationService`, `resolveActor().organizationId` | **Yes** |
| `brands` | Customer-facing brand | belongs to `organizations`; owns `websites` | Org | member-read, `settings.brand.update` write | `OrganizationService` | **Yes** |
| `websites` | A site/subdomain/app | belongs to `brands` | Org (via brand) / Brand / self | public (`ACTIVE` only) + staff | `OrganizationService`, RLS `auth_user_website_ids()` | **Yes** |
| `business_units` | Tour/MICE/Flight/... grouping | belongs to `organizations`; optionally referenced by `departments` | Org | member-read | nothing yet reads this for a decision | Defer implementation |
| `offices` | Physical office/branch | belongs to `organizations`; referenced by `departments`, `employee_profiles` | Org | member-read | `employee_profiles.office_id` | Defer implementation |
| `departments` | Internal department | belongs to `organizations`; optional `business_unit_id`/`office_id`/self-parent | Org | member-read | `employee_profiles.department_id`, (deferred) `form_routing_rules.target_department_id` | Defer implementation |
| `positions` | Job title within a department | belongs to `departments` | Org (via department) | member-read | `employee_profiles.position_id` | Defer implementation |

### Identity + RBAC — `0005_identity_and_rbac.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `user_profiles` | App-side extension of `auth.users` | 1:1 with Supabase Auth user | self-scoped | self + `user.manage` | `resolveActor()`, `AccessControlService` | **Yes** |
| `employee_profiles` | HR fields (department/position/manager) | belongs to `user_profiles`, `departments`, `positions`, `offices` | Org (via department/office) | self + `user.manage` | nothing calls this yet | Defer implementation |
| `user_organization_memberships` | Which org(s) a user belongs to | `user_profiles` × `organizations` | Org | self + `user.manage` | **`auth_user_organization_ids()`** — a core RLS helper | **Yes** |
| `user_brand_memberships` | Which brand(s) a user belongs to | `user_profiles` × `brands` | Brand | self + `user.manage` | `auth_user_website_ids()` (brand → its websites) | **Remove/merge — see §3** |
| `user_website_access` | Which website(s) a user has explicit access to | `user_profiles` × `websites` | Site | self + `user.manage` | **`auth_user_website_ids()`** — a core RLS helper | **Yes** |
| `roles` | The 8 fixed roles | referenced by `role_permissions`, `user_roles` | — | any authenticated read | `AccessControlService.listRoles()` | **Yes** |
| `permissions` | Permission catalog | referenced by `role_permissions` | — | any authenticated read | `requirePermission()` / `auth_has_permission()` | **Yes** |
| `role_permissions` | Role ↔ permission grants | `roles` × `permissions` | — | any authenticated read | `auth_has_permission()` | **Yes** |
| `user_roles` | Role assignment to a user | `user_profiles` × `roles` | — | self + `user.manage` | `AccessControlService.assignRole/revokeRole` | **Yes** |
| `role_scopes` | Scope limiter for a `user_roles` grant | belongs to `user_roles` | Org/Brand/Site/BU (polymorphic) | self + `user.manage` | nothing checks scope yet — `auth_has_permission()` is scope-blind by design (see `docs/database/rls-policy-matrix.md`) | Defer implementation |

### Settings — `0006_settings.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `setting_definitions` | Declares a setting's type/secrecy/visibility | referenced by `setting_values` | — | any authenticated read | none yet — no settings service built | Defer implementation |
| `setting_values` | Resolved value per scope | belongs to `setting_definitions`; polymorphic scope | Org/Brand/Site/User (polymorphic) | public only if `visibility='PUBLIC'` | none yet | Defer implementation |
| `setting_value_history` | Change history for a setting value | belongs to `setting_values` | (inherits) | staff read only | none yet | **Remove/merge — see §3** |

### Master data (extended) — `0007_master_data_extended.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `provinces` | Administrative province/city | belongs to `countries` | — | anon-readable | `cities.province_id` | Defer implementation |
| `cities` | Administrative city | belongs to `provinces` | — | anon-readable | nothing yet | Defer implementation |
| `destinations` | Marketing destination hierarchy | self-referencing; belongs to `countries` | — | public (`ACTIVE`) | seeded (Hà Nội/Hải Phòng/Hạ Long/Cát Bà); no product module reads it yet | Defer implementation |
| `destination_translations` | Localized name/slug/description | belongs to `destinations` | — | public (parent active) | same as above | Defer implementation |
| `airports` | Airport lookup | belongs to `countries` | — | anon-readable | nothing — Flight domain doesn't exist | **Defer to later sprint** |
| `harbors` | Harbor lookup | belongs to `countries` | — | anon-readable | nothing — Cruise domain doesn't exist | **Defer to later sprint** |
| `transportation_types` | Transport mode lookup | — | — | anon-readable | nothing yet | **Defer to later sprint** |
| `product_types` | TOUR/HOTEL/.../OTHER catalog | — | — | anon-readable | nothing yet (Product Core is Sprint 2+) but cheap and CRM/Booking will need it soon | Defer implementation |
| `supplier_types` | Supplier category lookup | — | — | anon-readable | nothing — Supplier domain doesn't exist | **Defer to later sprint** |
| `customer_types` | INDIVIDUAL/CORPORATE/... lookup | — | — | anon-readable | nothing yet, but CRM (Sprint 2) will need it immediately | Defer implementation |
| `units_of_measure` | Generic UoM lookup | — | — | anon-readable | nothing — no Pricing domain | **Defer to later sprint** |
| `tax_categories` | Tax rate lookup | — | — | anon-readable | nothing — no Pricing domain | **Defer to later sprint** |

### Media — `0008_media.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `media_folders` | Folder grouping | self-referencing; optional `website_id`/`brand_id` | Brand/Site (both, redundant — see §3) | staff-only | none yet | Defer implementation |
| `media_assets` | Uploaded file metadata | optional `folder_id`/`website_id`/`brand_id` | Brand/Site (both, redundant — see §3) | public if `visibility='PUBLIC'` | CMS block images, brand logos, avatars | **Yes** |
| `media_asset_versions` | Thumbnail/compressed variants | belongs to `media_assets` | (inherits) | staff-only | no image pipeline exists | **Defer to later sprint** |
| `media_tags` | Tag catalog | referenced by mappings | — | staff-only | no media library admin UI | **Defer to later sprint** |
| `media_asset_tag_mappings` | Asset ↔ tag | `media_assets` × `media_tags` | (inherits) | staff-only | same | **Defer to later sprint** |
| `media_usages` | Where an asset is referenced | polymorphic `(entity_type, entity_id)` | (inherits) | staff-only | no admin delete-safety UI | **Defer to later sprint** |

### CMS — `0009_cms.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `cms_templates` | Named layout template | belongs to `websites` | Site | staff-only | nothing — no template picker exists or is planned | **Remove/merge — see §3** |
| `cms_pages` | A page | belongs to `websites` | Site | public (has published version) + staff | replaces `lib/cms/client.ts`'s seed-file read path | **Yes** |
| `cms_page_versions` | Draft/published version of a page | belongs to `cms_pages`; optional `template_id`/`seo_metadata_id` | (inherits) | public (published+current) + staff | version/publish workflow | **Yes** |
| `cms_sections` | Layout region within a version | belongs to `cms_page_versions` | (inherits) | public (parent published) | page rendering | **Yes** |
| `cms_block_definitions` | The 20 block types (Hero, FAQ, ...) | referenced by `cms_blocks`, `reusable_content_blocks` | — | public (`ACTIVE`) | block renderer registry | **Yes** |
| `cms_blocks` | A configured block instance | belongs to `cms_sections`; typed by `cms_block_definitions` | (inherits) | public (parent published) | page rendering | **Yes** |
| `cms_page_template_mappings` | Default template per page type per site | belongs to `websites`, `cms_templates` | Site | staff-only | depends on `cms_templates` | **Remove/merge — see §3** |
| `reusable_content_blocks` | Named block reusable across pages | belongs to `websites`; typed by `cms_block_definitions` | Site | public (`ACTIVE`) | nothing built yet | **Defer to later sprint** |
| `announcements` | Announcement bar content | belongs to `websites` | Site | public (live window) | nothing built yet, small feature | Defer implementation |
| `faq_categories` | FAQ grouping | belongs to `websites` | Site | public (`ACTIVE`) | nothing built yet | Defer implementation |
| `faqs` | FAQ entry | belongs to `faq_categories`, `websites` | Site | public (`ACTIVE`) | nothing built yet | Defer implementation |

### Navigation — `0010_navigation.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `navigation_menus` | HEADER/FOOTER/... menu per site+locale | belongs to `websites` | Site | public (`ACTIVE`) | replaces hardcoded header/footer links | **Yes** |
| `navigation_items` | Menu entry, hierarchical | belongs to `navigation_menus`; optional self-parent, `cms_page_id` | (inherits) | public (`ACTIVE`) | same | **Yes** |

### Forms — `0011_forms.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `form_definitions` | Named form (contact, MICE, ...) | belongs to `websites` | Site | public (`ACTIVE`) | dynamic form builder — no admin UI planned; V1's known forms are still coded (Zod + React), not DB-configured | **Defer to later sprint** |
| `form_versions` | Version of a form's field set | belongs to `form_definitions` | (inherits) | public (current+published) | depends on `form_definitions` | **Defer to later sprint** |
| `form_fields` | A field within a version | belongs to `form_versions` | (inherits) | public (parent published) | depends on `form_versions` | **Defer to later sprint** |
| `form_submissions` | A submitted form | belongs to `websites`; optional `assigned_department_id`; placeholder `customer_id`/`lead_id` | Site | **no anon policy** — service-role insert only; staff read | the actual lead-capture path (contact/consultation forms) — needed **now**, but its FK dependency on `form_definitions`/`form_versions` should be loosened, see §3 | **Yes, after simplification** |
| `form_submission_values` | EAV-style answer per field | belongs to `form_submissions`, `form_fields` | (inherits) | staff read (parent's permission) | depends on deferred `form_fields` | **Remove/merge — see §3** |
| `form_routing_rules` | Auto-assign submission to a department | belongs to `form_definitions`, `departments` | Site (via form) | staff-only | depends on deferred `form_definitions` | **Defer to later sprint** |
| `form_notification_rules` | Auto-notify on submission | belongs to `form_definitions` | Site (via form) | staff-only | depends on deferred `form_definitions` and deferred `notifications` | **Defer to later sprint** |

### SEO — `0012_seo.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `seo_metadata` | Title/description/OG/canonical per entity | polymorphic `(entity_type, entity_id)`; belongs to `websites` | Site | public read | `cms_page_versions.seo_metadata_id`, needed for any real page `<head>` | **Yes** |
| `seo_schema_definitions` | JSON-LD template library | — | — | public read | **already built without this table** — `components/seo/json-ld.tsx` hand-constructs JSON-LD per page type today | **Remove/merge — see §3** |
| `redirect_rules` | 301/302 rule | belongs to `websites` | Site | public (`ACTIVE`) | needed once any live slug changes, not day one | Defer implementation |
| `slug_history` | Old-slug lookup for auto-redirects | belongs to `websites` | Site | staff-only | same as above | Defer implementation |
| `sitemap_entries` | Materialized sitemap queue | belongs to `websites` | Site | public read | **already built without this table** — `app/sitemap.ts` is a working, code-based Next.js route | **Remove/merge — see §3** |
| `robots_rules` | robots.txt directive | belongs to `websites` | Site | public read | **already built without this table** — `app/robots.ts` is a working, code-based Next.js route | **Remove/merge — see §3** |

### Notifications — `0013_notifications.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `notifications` | In-app notification | belongs to `user_profiles` | self-scoped | self read/update | nothing creates one yet — no lead/booking exists to trigger "new lead" | **Defer to later sprint** |
| `notification_templates` | Message template | — | — | any authenticated read | depends on `notifications` having a producer | **Defer to later sprint** |
| `notification_delivery_logs` | Delivery attempt log | belongs to `notifications` | (inherits) | staff-only | same | **Defer to later sprint** |

### Integration registry — `0014_integrations_registry.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `integration_providers` | Provider catalog | referenced by `integration_connections` | — | any authenticated read | no real integration is being wired in Sprint 1B | **Defer to later sprint** |
| `integration_connections` | A connection instance | belongs to `integration_providers`; optional `organization_id`/`website_id` | Org/Site (optional) | staff-only | same | **Defer to later sprint** |
| `integration_webhook_endpoints` | Webhook receiver config | belongs to `integration_connections` | (inherits) | staff-only | same | **Defer to later sprint** |
| `integration_sync_logs` | Sync attempt log | belongs to `integration_connections` | (inherits) | staff-only | same | **Defer to later sprint** |

### Audit — `0015_audit.sql`

| Table | Purpose | Key relationships | Org/Brand/Site | RLS | Consumer | Sprint 1B? |
|---|---|---|---|---|---|---|
| `audit_logs` | Append-only action log | polymorphic `entity_type`/`entity_id`; optional `organization_id`/`website_id` | Org/Site (optional) | `audit.read` only, no write policy for any role | every mutating service method, once real | **Yes** |
| `audit_log_changes` | Field-level diff for a log entry | belongs to `audit_logs` | (inherits) | `audit.read` only | same | **Yes** |
| `security_events` | Security-relevant event (login failure, etc.) | optional `actor_user_id` | — | `audit.read` only | Supabase Auth webhook / manual logging, once real | **Yes** |

---

## 2. Classification summary

| Category | Count | Tables |
|---|---|---|
| **A — REQUIRED_FOR_SPRINT_1B** | 26 | `currencies`, `languages`, `countries`, `organizations`, `brands`, `websites`, `user_profiles`, `user_organization_memberships`, `user_website_access`, `roles`, `permissions`, `role_permissions`, `user_roles`, `media_assets`, `cms_pages`, `cms_page_versions`, `cms_sections`, `cms_block_definitions`, `cms_blocks`, `navigation_menus`, `navigation_items`, `form_submissions` (after simplification, §3), `seo_metadata`, `audit_logs`, `audit_log_changes`, `security_events` |
| **B — KEEP_SCHEMA_DEFER_IMPLEMENTATION** | 20 | `business_units`, `offices`, `departments`, `positions`, `employee_profiles`, `role_scopes`, `setting_definitions`, `setting_values`, `provinces`, `cities`, `destinations`, `destination_translations`, `product_types`, `customer_types`, `media_folders`, `announcements`, `faq_categories`, `faqs`, `redirect_rules`, `slug_history` |
| **C — DEFER_TO_LATER_SPRINT** (dropped from the Sprint 1B migration set entirely, re-added when their owning domain actually starts) | 28 | `airports`, `harbors`, `transportation_types`, `supplier_types`, `units_of_measure`, `tax_categories`, `media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages`, `cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks`, `form_definitions`, `form_versions`, `form_fields`, `form_routing_rules`, `form_notification_rules`, `seo_schema_definitions`, `sitemap_entries`, `robots_rules`, `notifications`, `notification_templates`, `notification_delivery_logs`, `integration_providers`, `integration_connections`, `integration_webhook_endpoints`, `integration_sync_logs` |
| **D — REMOVE_OR_MERGE** (bad fit as designed, not just "not yet") | 3 | `user_brand_memberships` (merge into org+website membership), `setting_value_history` (merge into `audit_logs`), `form_submission_values` (merge into a `form_submissions.payload jsonb` column) |

**77 = 26 + 20 + 28 + 3.** No table was kept solely because it "might be useful later" — every B/C classification above names the concrete missing consumer, and every C table is a clean lift-out with nothing else depending on it (verified while writing §1).

---

## 3. Over-engineering findings

1. **Three membership tables where two would do.** `user_organization_memberships`, `user_brand_memberships`, `user_website_access` all exist, but V1 has exactly one organization and one brand. `user_brand_memberships` adds a scope level (brand) that, with a single brand, never produces a different answer than organization membership already does — it's a table that can only prove its worth once a second brand exists. **Recommend removing it now** and re-introducing it (or folding brand access into `role_scopes`, which already models brand-level scoping generically) when a second brand is actually seeded. `user_organization_memberships` and `user_website_access` stay — both are read directly by the two RLS helper functions (`auth_user_organization_ids()`, `auth_user_website_ids()`) and aren't redundant with each other (website access can be granted without full org membership, e.g. a contractor scoped to one site).

2. **Duplicate ownership fields on `media_folders`/`media_assets`.** Both carry independent nullable `website_id` AND `brand_id` columns. Since every website already belongs to exactly one brand (`websites.brand_id`), `brand_id` on a media row is derivable and can silently disagree with `website_id` (e.g. `website_id` under Brand A, `brand_id` set to Brand B — nothing stops that today). **Recommend dropping `brand_id` from both tables**; brand-level media (not tied to one website) can use `website_id IS NULL` with a scope resolved through the uploader's brand membership instead of a second stored column.

3. **Premature versioning: `form_versions`/`form_fields`.** This is a legitimate design for an admin-configurable dynamic form builder — but no such admin UI is planned for Sprint 1B, and V1's actual forms (contact, MICE consultation, custom tour request) are still defined in code (`lib/cms/schema.ts`'s Zod schemas, React components), matching the existing, working pattern in this repo. Building the relational version/field model now is solving a problem ("ops needs to add form fields without a deploy") nobody has asked for yet. **Recommend deferring the whole `form_definitions`/`form_versions`/`form_fields`/`form_routing_rules`/`form_notification_rules` chain**, keeping only `form_submissions` (see #5 below) as the actual intake table the coded forms write into.

4. **Premature workflow table: `setting_value_history`.** This duplicates what `audit_logs` already does (master-prompt's own settings requirement was "audit history," which the general audit log already satisfies once real). Maintaining two parallel change-history mechanisms for the same event is unnecessary. **Recommend merging into `audit_logs`** — a settings write logs there like every other mutation, with no dedicated table.

5. **EAV pattern where a JSONB column would be simpler: `form_submission_values`.** A submission's answers are stored as one row per field (`form_submission_id`, `form_field_id`, `value`), which requires the (now-deferred) `form_fields` table to even interpret. **Recommend a single `form_submissions.payload jsonb` column instead** — the shape a lead's answers take is decided by the (still Zod-validated, code-defined) form schema at write time, not something that needs a relational join to read back. This also removes `form_submissions`' hard dependency on the deferred `form_definitions`/`form_versions` tables — replace those FKs with a plain `form_key text` column (e.g. `'contact'`, `'mice-consultation'`) matching what the Zod schema in code already names it.

6. **Premature integration tables: the entire registry module.** `integration_providers`/`integration_connections`/`integration_webhook_endpoints`/`integration_sync_logs` model a capability (tracking real, credentialed third-party connections) that Sprint 1B doesn't exercise — no email/Telegram/Zalo/analytics integration is being wired yet. **Recommend deferring the whole module** until the first real integration (most likely transactional email, needed once `form_submissions` should trigger a staff notification) is actually built — at which point `integration_providers`/`integration_connections` earn their keep immediately instead of sitting empty.

7. **Premature workflow module: `notifications`.** Nothing in Sprint 1B creates a notification — that only starts happening once CRM (Sprint 2) creates a lead worth alerting someone about. **Recommend deferring the whole module** (`notifications`, `notification_templates`, `notification_delivery_logs`) to land together with CRM.

8. **Empty abstraction: `cms_templates`/`cms_page_template_mappings`.** A named-template-picker layer makes sense once there are many pages that need a consistent, admin-selectable layout. Today (and in this repo's existing code), page composition is hardcoded per page in React (`sections/*.tsx`, `components/homepage/*`) — there is no dynamic template-selection UI planned. **Recommend deferring both tables**; `cms_page_versions.template_id` becomes nullable-and-unused until a real template picker is built, or the column is dropped now and re-added then.

9. **Nice-to-have, not yet earning its complexity: `reusable_content_blocks`, `media_asset_versions`, `media_tags`/`media_asset_tag_mappings`, `media_usages`.** Each is a reasonable idea with zero current caller. **Recommend deferring all four** — none is load-bearing for anything else in the A/B lists.

10. **Relational tables that duplicate already-working code: `seo_schema_definitions`, `sitemap_entries`, `robots_rules`.** Verified directly: `app/sitemap.ts` and `app/robots.ts` are working, code-based Next.js file-convention routes today; `components/seo/json-ld.tsx` hand-builds JSON-LD per page type. None of the three reads from these tables, and moving them to be DB-driven isn't something anything in Sprint 1B needs. **Recommend removing all three** rather than "defer" — they were speculative from the start, not a capability anything is waiting on.

11. **A real bug, not just a design opinion: `websites.domain` has two overlapping unique constraints.** `database/migrations/0004_organization.sql` declares `domain citext not null unique` (a permanent, whole-table unique constraint) *and* a separate partial unique index `websites_domain_active_idx on websites(domain) where deleted_at is null` — the comment on the partial index implies the intent was "a domain can be reused after its old website row is soft-deleted," but the blanket column-level `unique` already forbids that regardless of `deleted_at`. The partial index is dead weight and the actual behavior silently contradicts the documented intent. **Must fix**: drop the column-level `unique`, keep only the partial index, when this migration is next touched.

12. **Not over-engineered, flagged for awareness only: `brands.slug` is globally unique**, not unique-per-organization. Harmless with one organization; worth a one-line note in the data dictionary so a second organization later doesn't hit a surprising collision.

---

## 4. Organization–Brand–Website ownership model review

Confirmed directly against `database/migrations/0004_organization.sql`:

- ✅ One organization → many brands (`brands.organization_id not null references organizations(id)`, no uniqueness constraint limiting count).
- ✅ One brand → many websites (`websites.brand_id not null references brands(id)`).
- ✅ A website belongs to exactly one brand (single FK column, not a join table).
- ✅ Only `minhviettravel.com` is seeded `ACTIVE` (`database/seeds/0002_organization.sql`).
- ✅ `vemaybay.minhviettravel.com` exists as a `PLANNED` website row, not `ACTIVE` — satisfies the acceptance criterion without building anything behind it.
- ✅ Future websites are addable without a primary-key or schema change — `docs/playbooks/add-new-website.md` describes this as a pure `INSERT`.
- ✅ Website-specific content stays isolated: `cms_pages`, `form_definitions`(deferred)/`form_submissions`, `seo_metadata`, `navigation_menus`, `faq_categories`, `announcements`, `redirect_rules` all carry `website_id`, and every RLS policy for these tables is written against the row's own `website_id`/status, never a hardcoded id.
- ✅ Global records correctly omit `website_id`: `roles`, `permissions`, `currencies`, `languages`, `countries`, `product_types`, `customer_types`, and (after this review's reductions) the rest of master data are website-agnostic by design, not by oversight.

No change recommended to the ownership model itself — it holds up. The only ownership-model finding is the `media_folders`/`media_assets` duplicate `brand_id`+`website_id` issue already covered in §3.2.

---

## 5. RBAC complexity review

- **Role catalogue**: confirmed exactly Volume 00's 8 roles are seeded (`database/seeds/0003_rbac.sql`) — `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `BOOKING`, `OPERATION`, `MARKETING`, `VIEWER`. The master prompt's 13-role catalogue was **not** used, per your standing instruction, and nothing in the reviewed schema depends on more than 8.
- **Permission naming**: consistent dotted `module.entity.action` convention throughout (`cms.page.publish`, `user.manage`, `settings.website.update`) — no naming drift found across `database/seeds/0003_rbac.sql`, `database/policies/`, and `shared/auth/session.ts`.
- **Role scope (`role_scopes`)**: with exactly one active organization/brand and one active website, a scope check can only ever return "yes, organization-wide" — there is no second website or brand for a scoped grant to meaningfully exclude yet. **Recommend classification B (keep the table, since it costs nothing to leave in schema and `role_scopes` is what stops the 13-role/fine-grained-scope future work from requiring a migration later), but do not build scope-aware permission checking in Sprint 1B** — `auth_has_permission()` staying scope-blind (checks "does this user hold this permission at any scope") is the right amount of complexity for one active website.
- **Website/organization access**: `auth_user_website_ids()`/`auth_user_organization_ids()` are both simple, single-purpose SQL functions with no hidden recursion or N+1 risk (each is a flat `SELECT`/`UNION`, not a recursive CTE) — understandable by a small team without a walkthrough.
- **Verdict**: the authorization model as designed (2 RLS helper functions + 1 permission-check function + `requirePermission()` at the service layer) is implementable and explainable in under a page, which is what Volume 00's team size assumption calls for. No reduction needed here beyond not building `role_scopes`-aware logic yet.

---

## 6. Migration file review (0001–0015)

- **Execution order**: correct as-is — every FK target is created before the table that references it, with exactly the two documented forward-reference exceptions (media → `brands`/`destinations`/`user_profiles`, both patched via `ALTER TABLE` in `0008_media.sql`; SEO → `cms_page_versions`, patched in `0012_seo.sql`). No circular FK exists anywhere in the 15 files.
- **Duplicate/incorrect unique constraints found**: `websites.domain` — see §3.11. This is the one concrete bug in the current migration set.
- **Missing dependencies**: none found — every migration's tables that reference an enum or a prior table have that enum/table already created by an earlier file.
- **Missing indexes**: none found for the tables recommended to stay (A/B); every FK column used in a join by a service or RLS policy has a supporting index.
- **Unsafe cascade deletes**: none found. Cascades are used only where deleting the parent should obviously delete the child (e.g. `cms_sections`/`cms_blocks` cascade from `cms_page_versions` — deleting a draft version should delete its content). Ownership FKs that should block deletion instead of cascading correctly use `ON DELETE RESTRICT` (`brands.organization_id`, `websites.brand_id`, `destinations.parent_destination_id`).
- **Enum stability**: all 13 enums in `0002_shared_enums.sql` are small, fixed vocabularies unlikely to churn — appropriate use of `CREATE TYPE ... AS ENUM` rather than a lookup table, per the file's own stated rule. Two enums (`notification_channel`, `notification_priority`) and one (`integration_status`) are only used by tables this review recommends deferring — removing those tables also removes any live use of those three enum types.
- **Trigger order / `updated_at` implementation**: `set_updated_at()` (defined once in `0001`) is attached consistently to every table that has an `updated_at` column; spot-checked across all 15 files, no table with `updated_at` is missing the trigger and no table without the column has one attached by mistake.
- **RLS enablement order**: correctly separate from migrations — all `ENABLE ROW LEVEL SECURITY` statements live in `database/policies/`, applied after all 15 migrations, so there is no window where a table exists without RLS being immediately enabled once policies run. (Verified: the 13 master-data lookup tables are enabled via the dynamic `DO $$ ... EXECUTE format(...) $$` loop in `0003_internal_tables_policies.sql`, not a literal per-table statement — a naive grep for the literal SQL text initially suggested a gap; there is none.)
- **Seed dependency order**: correct — `0001` (master data) → `0002` (org/brand/websites, needed by everything after) → `0003` (RBAC, global, no dependency on `0002` but ordered after it) → `0004` (settings, needs the org id from `0002`) → `0005` (CMS/nav/forms/SEO, needs the website id from `0002` and inserts `cms_block_definitions` before referencing them in the same file) → `0006` (integrations catalog, standalone).
- **Recommendation**: since nothing has executed yet, **squash to reflect the reduced scope** rather than preserving all 15 files' history. See §10 for the exact resulting file list.

---

## 7. RLS review — the 13 named tables

- **`user_profiles`**: self-read/self-update (`id = auth.uid()`) plus `user.manage` for staff. Correct — no unauthenticated access, and a user can't read another user's profile without an explicit permission grant.
- **`user_organization_memberships` / `user_brand_memberships` / `user_website_access`**: self-read + `user.manage` write, consistent across all three today. Once `user_brand_memberships` is removed (§3.1), this becomes two tables instead of three with identical policy shape — no policy logic changes, just one less table to keep in sync.
- **`roles` / `permissions`**: intentionally world-readable to any authenticated user (names/keys aren't secret) with `role.manage`-gated writes. Correct — this is what lets `AccessControlService.listRoles()` work for any staff member without a separate "can view roles" permission.
- **`settings` (`setting_definitions`/`setting_values`)**: public read only when `setting_definitions.visibility = 'PUBLIC'`; the write policy's `WITH CHECK` additionally blocks writing a value for any `is_secret` definition, a second real enforcement layer beyond documentation. Correct as designed; deferred to Sprint 1B implementation per §2, not a Sprint 1B RLS risk since nothing calls it yet.
- **`cms_pages` / `cms_page_versions`**: public read requires both "page not soft-deleted" and "has a version that is `is_current AND status='PUBLISHED'`" — an unpublished or draft-only page is invisible to `anon`, verified by reading the policy SQL directly, not just the intent. Correct.
- **`navigation`**: public read gated on `status='ACTIVE'` only (no separate publish workflow, unlike CMS) — appropriate, since navigation doesn't need draft/review states in V1.
- **`media`**: `media_assets` splits public (`visibility='PUBLIC'` non-deleted) from staff-only (everything else via `media.asset.read`) — correct, this is the one table in the schema where "public" and "internal" rows coexist in the same table rather than being different tables, and the policy correctly filters by row, not by table.
- **`forms` / `form_submissions`**: confirmed **no anon INSERT policy exists at all** on `form_submissions`/`form_submission_values` — by design (`docs/database/rls-policy-matrix.md`'s explicit rationale). This remains correct after this review's recommended simplification (`form_submissions` keeps the same no-anon-write posture even without the `form_fields`/`form_definitions` chain behind it).
- **`seo_metadata`**: fully public-read (`true`) — correct, since this table's entire purpose is to end up in a public `<head>` tag; there's no sensitive content to gate.
- **`audit_logs`**: confirmed **no INSERT/UPDATE/DELETE policy exists for any role** — reads require `audit.read`; writes only happen via the service-role bypass. The `forbid_mutation()` trigger is a second, independent enforcement layer that fires regardless of what grants exist. This is the strongest-protected table family in the schema and correctly so.

**Privilege escalation check**: no policy anywhere allows a user to grant themselves a role or permission — `user_roles`/`role_permissions`/`role_scopes` writes all require `user.manage`/`role.manage`, which nothing in the seeded RBAC grants to a non-admin role by default (`SALES`/`BOOKING`/`OPERATION`/`VIEWER`/`MARKETING` hold none of those two permissions per `database/seeds/0003_rbac.sql`).

---

## 8. Module implementation pattern review

Evaluated `modules/organization/` and `modules/access-control/` directly:

- **Route Handler → Zod validation → Authorization → Service → Repository → Supabase**: present and sufficient. Confirmed no extra layer exists beyond this: no abstract base repository class, no factory function generating repositories, no mapper class translating snake_case↔camelCase (that mapping is meant to happen inline inside each repository method, not through a separate abstraction), and no dependency-injection container — services take their repository as a plain constructor argument (`new OrganizationService(new SupabaseOrganizationRepository(client))`), which is the entire "DI" mechanism in the codebase.
- **Nothing to remove.** This is the one area of the review with no reduction recommended — the pattern is already at the minimum viable layering for the stated goal (testable service logic, one seam per concern), and removing any of the five steps would either mix concerns (e.g. validation inside the service) or remove the one thing that makes the service unit-testable without a database (the repository interface).
- **One naming inconsistency worth fixing while it's cheap**: `modules/access-control/` combines identity + RBAC into one module folder (a documented Sprint-1A grouping decision, `sprint-1-implementation-plan.md` §2) — confirm this remains a **folder-organization** decision only, not a reason to blur the two into a single service class if/when Sprint 1B splits it; today `AccessControlService` already mixes "own profile" methods with "role management" methods in one class, which is fine at the current size (5 methods) but should split into `IdentityService`/`RoleService` before it grows further. Not urgent — noted for awareness, not a required action now.

---

## 9. Documentation consistency check

| Source A | Source B | Mismatch found |
|---|---|---|
| `docs/backend/sprint-1-implementation-report.md` | actual migrations | **Report says "55 tables"; actual is 77.** Needs a one-line correction once this review is filed. |
| `docs/database/erd.md` | actual migrations | None — both list exactly the same 77 tables with matching relationships. |
| `docs/database/rls-policy-matrix.md` | actual `database/policies/*.sql` | None — every policy described in the matrix exists in the SQL, and the 13-table dynamic-loop coverage (master data) is correctly described as "anon + authenticated" in the matrix even though it's generated by a loop rather than literal per-table statements. |
| `docs/api/sprint-1-endpoints.md` | this review's reductions | **Will go stale once reductions are applied** — it documents target endpoints for `forms` (submission CRUD assuming `form_definitions`), `notifications`, and `integrations`, all modules this review recommends deferring. Not a mismatch *today* (nothing there claims to be built yet), but flagged so it's updated in the same pass as the migrations, not forgotten. |
| `database/seeds/0001_core_master_data.sql`, `0006_integrations.sql` | this review's reductions | Seed data currently populates `supplier_types`, `units_of_measure`, `tax_categories` (recommended C) and the full `integration_providers` catalog (recommended C). These seed files will need trimming to match whatever migration set is approved — listed as a required follow-up in §10, not applied yet. |
| `modules/organization`, `modules/access-control` code | this review's reductions | None — both reference only tables classified A (kept) or, for `role_scopes`, a table classified B (schema stays, just unused by today's code, which is already true and unchanged by this review). |

No fictional table, column, or endpoint was found described in documentation that doesn't exist in code/schema, aside from the numeric error above.

---

## 10. Recommended minimal Sprint 1B schema

- **Tables retained (A + B): 46** — see the two lists in §2.
- **Tables deferred to a later sprint (C), dropped from the Sprint 1B migration set entirely: 28** — see §2; each has a named future owner (Flight/Cruise/Supplier/Pricing sprint, Media pipeline work, CMS template-picker work, dynamic form-builder work, first real integration, CRM/notifications pairing).
- **Tables removed or merged (D): 3** — `user_brand_memberships` (fold into existing org/website membership + `role_scopes`), `setting_value_history` (fold into `audit_logs`), `form_submission_values` (fold into a new `form_submissions.payload jsonb` column).
- **Final expected table count for Sprint 1B: 46.**

### Migration files

| File | Disposition |
|---|---|
| `0001_extensions_and_helpers.sql` | Retain unchanged |
| `0002_shared_enums.sql` | Change — drop `notification_channel`, `notification_priority`, `integration_status` (only used by deferred tables) |
| `0003_master_data_core.sql` | Retain unchanged |
| `0004_organization.sql` | Change — fix the `websites.domain` duplicate-unique-constraint bug (§3.11) |
| `0005_identity_and_rbac.sql` | Change — remove `user_brand_memberships` |
| `0006_settings.sql` | Change — remove `setting_value_history` |
| `0007_master_data_extended.sql` | Change — remove `airports`, `harbors`, `transportation_types`, `supplier_types`, `units_of_measure`, `tax_categories` |
| `0008_media.sql` | Change — remove `brand_id` from `media_folders`/`media_assets`; remove `media_asset_versions`, `media_tags`, `media_asset_tag_mappings`, `media_usages` |
| `0009_cms.sql` | Change — remove `cms_templates`, `cms_page_template_mappings`, `reusable_content_blocks`; drop `cms_page_versions.template_id` |
| `0010_navigation.sql` | Retain unchanged |
| `0011_forms.sql` | Change significantly — remove `form_definitions`/`form_versions`/`form_fields`/`form_routing_rules`/`form_notification_rules`/`form_submission_values`; add `form_submissions.payload jsonb` and `form_submissions.form_key text` |
| `0012_seo.sql` | Change — remove `seo_schema_definitions`, `sitemap_entries`, `robots_rules` |
| `0013_notifications.sql` | **Remove entirely** (deferred to Sprint 2 with CRM) |
| `0014_integrations_registry.sql` | **Remove entirely** (deferred until the first real integration) |
| `0015_audit.sql` | Retain unchanged, renumber to `0013` after the two removed files |

Net: **15 files → 13 files**, **77 tables → 46 tables**.

### Risks

- Loosening `form_submissions` from a hard FK to `form_definitions`/`form_versions` (replacing with a plain `form_key text`) trades referential integrity for flexibility — a typo'd `form_key` silently creates an orphaned submission bucket instead of failing at insert time. Mitigation: validate `form_key` against a small hardcoded enum/const list in the Zod schema (mirroring today's `lib/cms/schema.ts` pattern), not at the database.
- Removing `user_brand_memberships` now means brand-level access control for a second brand later requires a small migration (re-add the table or extend `role_scopes` usage) rather than being already in place — acceptable, since it costs nothing today and the reduction's whole point is not paying for that until it's real.
- Deferring `redirect_rules`/`slug_history` (kept as B, not removed) means any slug change before Sprint 1B implements them needs a manual Next.js `next.config.mjs` redirect entry in the meantime — worth a one-line callout in the CMS playbook once page editing is real.

### Decisions requiring owner approval

1. Confirm removal of `user_brand_memberships` is acceptable given only one brand exists today (§3.1).
2. Confirm deferring the entire Forms dynamic-builder chain (keeping only a simplified `form_submissions`) matches how forms are actually expected to be managed in Sprint 1B (code-defined, not admin-configurable).
3. Confirm deferring Notifications and Integration Registry entirely (no schema at all until their respective trigger event — CRM, first real provider — exists) rather than keeping empty schema around.
4. Confirm removing `seo_schema_definitions`/`sitemap_entries`/`robots_rules` in favor of the existing code-based `app/sitemap.ts`/`app/robots.ts`/`components/seo/json-ld.tsx` is the intended direction, rather than migrating those files to be DB-driven.
5. Confirm the `websites.domain` unique-constraint fix (§3.11) — this is a correctness bug regardless of any scope decision and should be fixed even if every other recommendation above is rejected.

---

## Verification (this review changed no migration, policy, seed, or module file)

```
pnpm exec tsc --noEmit   → 0 errors
pnpm lint                → 0 warnings, 0 errors
pnpm build               → succeeds, same 25 static + 3 dynamic routes as before this review
```
