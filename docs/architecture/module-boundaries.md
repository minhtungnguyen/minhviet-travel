# Module Boundaries — Sprint 1 (post-reduction)

Each module owns its own tables (per `docs/database/erd.md`) and exposes a service (`modules/<name>/application`) that other modules call — modules never query another module's tables directly from their repository. Cross-module reads go through the owning module's service.

Table list reflects the Sprint 1A.2 reduction (`docs/backend/sprint-1a2-reduction-report.md`) — 47 active tables, not the original 77.

| Module (folder) | Owns (tables) | Depends on |
|---|---|---|
| `organization` | `organizations`, `brands`, `websites`, `business_units`, `offices`, `departments`, `positions` | master data (`countries`, `currencies`, `languages`) |
| `access-control` (combines identity + RBAC, see `sprint-1-implementation-plan.md` §2) | `user_profiles`, `employee_profiles`, `user_organization_memberships`, `user_website_access`, `roles`, `permissions`, `role_permissions`, `user_roles`, `role_scopes` | `organization` (departments/offices), Supabase Auth |
| `settings` | `setting_definitions`, `setting_values` | `organization`, `access-control` (write permission) |
| `master-data` | `countries`, `provinces`, `cities`, `destinations`, `destination_translations`, `currencies`, `languages`, `product_types`, `customer_types` | none (foundation layer everything else reads) |
| `media` | `media_folders`, `media_assets` | `organization` (website scoping) |
| `cms` | `cms_pages`, `cms_page_versions`, `cms_sections`, `cms_blocks`, `cms_block_definitions`, `announcements`, `faq_categories`, `faqs`, `navigation_menus`, `navigation_items` | `organization` (website), `media` (images), `seo` (attaches metadata) |
| `forms` | `forms`, `form_submissions` | `organization` (website) |
| `seo` | `seo_metadata`, `redirect_rules`, `slug_history` | `organization` (website), `media` (OG images) |
| `audit` | `audit_logs`, `audit_log_changes`, `security_events` | none — every other module calls into it, it depends on nothing (must never create a circular dependency back to a module it's logging) |

## Deferred modules (no active tables in Sprint 1B)

| Module | Status | Returns when |
|---|---|---|
| `notifications` | Deferred entirely — no tables, no policies (`docs/backend/sprint-1a2-reduction-report.md` §5) | CRM (Sprint 2) creates the first event worth alerting someone about |
| `integrations` (registry) | Deferred entirely — no tables, no policies (`docs/backend/sprint-1a2-reduction-report.md` §6). Connector contracts (`integrations/flight`, `integrations/attraction-ticket`, `integrations/email`, `integrations/ai`) still exist as TypeScript interfaces — only the SQL registry (`integration_providers`/`integration_connections`/...) was removed | The first real, credentialed integration is actually wired up |

## Rule

A module's repository (`modules/x/infrastructure`) only ever queries tables in its own row above. If module A's service needs data module B owns, A's service calls B's service — it does not import B's repository. Sprint 1A's two fleshed-out reference modules (`organization`, `access-control`) follow this already; the remaining modules get schema + RLS in full but only a thin domain/schema layer in Sprint 1A (`sprint-1-implementation-plan.md` §3, phase 4) — their service/repository layers are Sprint 1B work, built by copying the reference modules' shape.
