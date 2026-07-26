# Sprint 1B.2 — Implementation Plan

Checkpoint 1 deliverable. No application code or database change has been made while producing this plan.

## 1. Foundation audit — result

**Repository ↔ live database: match, confirmed.** `list_tables`/`list_migrations` against `mv-travel-os-dev` (ref `otusjahkdjpxqayeeqqn`) show 47 tables, migration history `0001`–`0015` (13 approved + 2 Sprint 1B.1 hardening migrations, both additive/non-schema), row counts matching the seed set exactly. Docs read in full: `sprint-1b1-database-deployment-report.md`, `erd.md`, `data-dictionary.md`, `rls-policy-matrix.md`, `security-model.md`, plus Volume 00's `CLAUDE.md`/`README.md` (single-site V1 scope, 8 fixed roles, no new microservices/stack changes, audit log on every important action — all already the standing constraint, nothing new).

**Existing Sprint 1A application code** (all placeholder — every repository method `throw`s, `resolveActor()`/`getServerSupabaseClient()` throw):
- `shared/errors/app-error.ts`, `shared/http/{response,request-id,handle-route}.ts`, `shared/validation/{pagination,common}.ts`, `shared/auth/session.ts`, `shared/supabase/{server-client,types}.ts` — the conventions this sprint must keep using, not replace.
- `modules/organization/*` (domain/schemas/infrastructure/application) — organizations, brands, websites CRUD skeleton. **Business units/offices/departments/positions have domain types but no repository methods or schema yet** — net-new work, not a rewrite.
- `modules/access-control/*` — user profile, roles, role assignment, effective-permissions skeleton. **No website-access, no employee-profile, no last-SUPER_ADMIN / self-elevation guards yet.**
- `app/api/v1/organizations/route.ts`, `.../[id]/route.ts`, `app/api/v1/roles/route.ts` — 3 reference routes demonstrating the Route → Zod → `resolveActor()` → Service (`requirePermission`) → Repository pattern every new route follows.
- `integrations/{flight,attraction-ticket,email,ai}/contracts/*` — future-provider TypeScript interfaces, zero live callers, not touched by this sprint.
- **No Supabase package installed** (`@supabase/supabase-js`, `@supabase/ssr` absent from `package.json`) — first real dependency addition this sprint makes.

**Frontend mock/seed data — explicitly untouched** (see §7). These already power the live public site (`pnpm build` output: `/`, `/tours`, `/tour/[slug]`, `/mice`, `/cruises`, `/hotels`, `/flights`, `/tickets`, `/visa`, `/tour-thiet-ke`, `/contact`, `/about`) and are unrelated to the new `cms_pages`/`forms` backend this sprint builds:
- `lib/site-data.ts`, `lib/tours/tour-detail-content.ts`, `lib/mice/mice-data.ts`, `lib/mice/mice-repository.ts`, `lib/inspiration/inspiration-demo-data.ts`, `lib/cms/content/homepage.seed.ts`, `lib/cms/client.ts`, `lib/cms/schema.ts` (the *existing* Zod content schema for the current hardcoded pages — a different thing from the new `modules/cms` this sprint adds for the database-backed CMS).
- `lib/actions/lead-action.ts` + `newsletter-action.ts` + `ai-advisor-action.ts` and the components that call them (`components/site/contact-form.tsx`, etc.) — the current lead-capture path (webhook-based, no Supabase). This sprint adds a **new, separate** public forms API (`POST /api/v1/public/sites/{websiteKey}/forms/{formKey}/submissions`) per the approved `forms`/`form_submissions` tables. Wiring the existing contact form to call it instead of the webhook is a frontend change and explicitly out of scope here — the new endpoint is built and tested standalone.

No gap analysis conflict found. Proceeding to plan.

## 2. Modules to implement

Layered exactly like `modules/organization`: `domain/types.ts` → `schemas/*.schema.ts` → `infrastructure/*.repository.ts` (real Supabase implementation, replacing the `notImplemented()` placeholders) → `application/*.service.ts` (`requirePermission` first in every mutating method, matching the existing two modules).

| Module | Status | New tables it owns |
|---|---|---|
| `shared` (infra) | extend | — |
| `modules/organization` | extend | `business_units`, `offices`, `departments`, `positions` (types exist, repo/service/schema net-new); real repo for `organizations`/`brands`/`websites` |
| `modules/access-control` | extend | + `user_website_access`, `employee_profiles`; real repo for existing types |
| `modules/settings` | new | `setting_definitions`, `setting_values` |
| `modules/master-data` | new | `currencies`, `languages`, `countries`, `provinces`, `cities`, `destinations`, `destination_translations`, `product_types`, `customer_types` |
| `modules/cms` | new | `cms_pages`, `cms_page_versions`, `cms_sections`, `cms_blocks`, `cms_block_definitions`, `announcements` |
| `modules/navigation` | new | `navigation_menus`, `navigation_items` |
| `modules/faq` | new | `faq_categories`, `faqs` |
| `modules/seo` | new | `seo_metadata`, `redirect_rules`, `slug_history` |
| `modules/forms` | new | `forms`, `form_submissions` |
| `modules/media` | new | `media_folders`, `media_assets` (metadata only, no Storage bucket) |
| `modules/audit` | new | `audit_logs`, `audit_log_changes` (write-only service, called by every other module) |

Every module's repository takes the real `SupabaseClient<Database>` (once `shared/supabase/types.ts#Database` is regenerated from the live schema via `supabase gen types typescript`) — the `SupabaseClientLike = unknown` placeholder is replaced, not kept alongside.

## 3. Shared infrastructure — concrete plan

- `shared/supabase/browser-client.ts` — `createBrowserClient` (`@supabase/ssr`), anon key only.
- `shared/supabase/server-client.ts` — rewritten (not appended): `createServerClient` bound to Next.js cookies, for Server Components / Route Handlers running as the signed-in user (RLS applies).
- `shared/supabase/admin-client.ts` — new, `createClient` with the service-role key, `import 'server-only'`, used **only** by `modules/audit` (writing `audit_logs`, which has no INSERT policy for any authenticated role by design) and the public form-submission route (per the approved RLS matrix: no anon INSERT policy on `form_submissions`, service role is the documented path). Every other module uses the session-bound client — RLS is the primary gate, service role is the documented exception, not the default.
- `shared/supabase/middleware-client.ts` — new, session refresh in `middleware.ts` (new file at repo root) so cookies stay valid across navigations — standard `@supabase/ssr` Next.js pattern.
- `shared/env.ts` — new, a single `zod`-validated `env` object read once (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL` optional/build-safe — see below), thrown as a clear `AppError`-independent startup error if a *required-at-runtime* variable is missing, never at module-import/build time.
- `shared/supabase/types.ts` — regenerated `Database` type from the live project (`mcp: generate_typescript_types` or CLI), replacing the placeholder.
- `shared/auth/session.ts` — real `resolveActor()`: reads the Supabase session from the request-bound server client, loads `user_profiles` + `user_organization_memberships` + `user_roles` → `role_permissions` + `user_website_access`, returns `ActorContext`. Adds `requireActiveMembership`, `requireAnyPermission`, `requireWebsiteAccess`, and the 5 new `AppErrorCode`s (`ACCOUNT_DISABLED`, `MEMBERSHIP_REQUIRED`, `WEBSITE_ACCESS_DENIED` — `UNAUTHENTICATED`/`FORBIDDEN` already exist).
- **Build-safety constraint carried over from Sprint 1A**: `pnpm build` must keep succeeding with no `SUPABASE_*` env vars set in CI/build context (only route handlers touch Supabase at request time; nothing at module top-level does a live call). Verified explicitly at the end of Checkpoint 2.

## 4. API routes proposed (all under `/api/v1/`, envelope per §5 of the spec — already implemented in `shared/http/response.ts`)

Full list mirrors the spec's suggested endpoints in each of its sections 6–17, minus anything already built (`GET/POST /organizations`, `GET/PATCH /organizations/{id}`, `GET /roles`). Net-new, grouped by module:

- **Auth**: `GET /auth/session`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/password-reset`, `POST /auth/password-update`
- **RBAC**: `GET /permissions`, `GET/POST /users/{id}/roles`, `DELETE /users/{id}/roles/{roleId}`, `GET/POST /users/{id}/website-access`, `DELETE /users/{id}/website-access/{websiteId}`
- **Organization**: `GET/POST /brands`, `GET/PATCH/DELETE /brands/{id}`, `GET/POST /websites`, `GET/PATCH/DELETE /websites/{id}`, same CRUD pattern for `/business-units`, `/offices`, `/departments`, `/positions`
- **Users**: `GET /users`, `GET/PATCH /users/{id}`, `GET/PATCH /users/{id}/profile`, `GET/PATCH /users/{id}/membership`
- **Settings**: `GET /settings`, `GET /settings/resolved`, `GET/PUT/DELETE /settings/{namespace}/{key}`
- **Master data**: `GET /master-data/{countries,provinces,destinations,currencies,languages,product-types,customer-types}` (+ admin mutation routes gated by `master_data.manage`)
- **CMS**: `GET/POST /cms/pages`, `GET/PATCH/DELETE /cms/pages/{id}`, `POST /cms/pages/{id}/{submit-review,approve,publish,archive}`, `GET /cms/pages/{id}/versions`, `GET/POST /cms/pages/{id}/sections`, `PATCH/DELETE /cms/sections/{id}`; public: `GET /public/sites/{websiteKey}/pages/{slug}`
- **Navigation**: `GET/POST /cms/navigation`, `GET/PATCH/DELETE /cms/navigation/{id}`, `POST /cms/navigation/{id}/items`, `PATCH/DELETE /cms/navigation/items/{itemId}`; public: `GET /public/sites/{websiteKey}/navigation/{menuKey}`
- **FAQ**: `GET/POST /cms/faq-categories`, `GET/PATCH/DELETE /cms/faq-categories/{id}`, `GET/POST /cms/faqs`, `GET/PATCH/DELETE /cms/faqs/{id}`; public: `GET /public/sites/{websiteKey}/faqs`
- **SEO**: `GET/PUT /seo/metadata/{entityType}/{entityId}`, `GET/POST /seo/redirects`, `GET/PATCH/DELETE /seo/redirects/{id}`
- **Forms**: `GET/POST /forms`, `GET/PATCH/DELETE /forms/{id}`, `GET /form-submissions`, `GET/PATCH /form-submissions/{id}`; public: `POST /public/sites/{websiteKey}/forms/{formKey}/submissions`
- **Media**: `GET/POST /media/folders`, `GET/POST /media/assets`, `GET/PATCH/DELETE /media/assets/{id}`

`cms_templates`/`reusable_content_blocks`/dynamic form builder/notifications/integration endpoints are **not** in this list — those tables don't exist (deferred in Sprint 1A.2), building an API against them would be out of scope. `cms/block-definitions` gets a read-only `GET` (catalog is seeded, `cms.template.manage` write deferred to when an admin UI needs it — not required for this sprint's DoD).

## 5. Test plan

Add **Vitest** (matches the one pre-existing `lib/tours/availability.test.ts`, which currently has no runner — this sprint fixes that gap too). `pnpm test` becomes a real script.

- Unit tests (no DB): Zod schema validation, `ActorContext`/`requirePermission`/`requireWebsiteAccess` guard logic against fake `ActorContext` fixtures, response-envelope shape, error-code → HTTP-status mapping.
- Integration tests (live `mv-travel-os-dev`, clearly-marked test data, cleaned up after each run — same discipline as Sprint 1B.1 Phase 7): organization isolation, website isolation, settings resolution order, CMS publish workflow (draft→review→approve→publish, `is_current` pointer correctness), public page filtering (unpublished never returned), slug uniqueness, redirect-loop rejection, public form validation + idempotency + submission privacy (no anon read), self-role-elevation denial, last-SUPER_ADMIN protection, audit-log creation on every listed mutation type.
- RLS/service-role isolation tests extend the Sprint 1B.1 role+claims-spoofing technique (`SET LOCAL ROLE ...; SELECT set_config('request.jwt.claims', ...)`) rather than reinventing it.

## 6. Risks

- **Scale**: ~12 modules, ~60 new routes, 13 docs. Proceeding checkpoint-by-checkpoint (per the spec's own §21) with `tsc`/`lint`/`test` at each, rather than one giant unreviewed pass.
- **Last-SUPER_ADMIN protection**: needs a live count check (`role.manage`-holding users with `SUPER_ADMIN`) inside `revokeRole`/role-removal — a genuine business rule, not just a permission check; will be unit- and integration-tested explicitly.
- **Settings resolution**: hierarchy (`USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > default`) is a real merge algorithm, not a single query — isolating it in a pure, testable function.
- **CMS publish workflow**: `is_current` pointer swap (old current → not current, new version → current) must be one transaction (Supabase RPC or sequential updates with a compensating check) to avoid a window with zero or two `is_current=true` rows.
- **Build-safety regression**: adding real Supabase clients risks accidentally requiring env vars at import time (breaking the Sprint 1A guarantee that `pnpm build` needs zero env vars) — every client factory stays lazy (called inside a request handler), verified explicitly.

## 7. Explicitly untouched frontend areas

`components/site/**`, `app/(site pages: /, /tours, /tour/[slug], /mice, /cruises, /hotels, /flights, /tickets, /visa, /tour-thiet-ke, /contact, /about)`, `lib/site-data.ts`, `lib/tours/*` (except adding, never modifying, the test runner that can now execute the pre-existing `availability.test.ts`), `lib/mice/*`, `lib/inspiration/*`, `lib/cms/client.ts` + `lib/cms/schema.ts` + `lib/cms/content/homepage.seed.ts`, `lib/actions/*`, `app/sitemap.ts`, `app/robots.ts`, `components/seo/json-ld.tsx`. No admin UI screens are built (per spec §1 — API layer only, "minimal internal verification screen" not judged essential given `pnpm exec tsc`/route-level testing already exercises every endpoint without one).

---

**Proceeding to Checkpoint 2 (shared infrastructure, auth, authorization, API conventions) next**, pending confirmation given the scale above.
