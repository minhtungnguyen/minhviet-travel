# Sprint 1B.2 — Backend Application Foundation: Implementation Report

**Status: COMPLETE.** All 5 checkpoints executed against the live `mv-travel-os-dev` database. No schema change beyond two Sprint 1B.1-carried-over hardening migrations (search_path fix, `auth.uid()` wrapping) — the approved 47-table schema is unchanged by this sprint.

---

## 1. Architecture implemented

Exactly the layered pattern the two Sprint 1A reference modules established, extended to 12 modules: `Route Handler → Zod validation (.strict()) → resolveActor() → Service (requirePermission/requireWebsiteAccess) → Repository → Supabase (session-bound client; RLS applies)`. Every module follows `domain/types.ts` → `schemas/*.schema.ts` → `infrastructure/*.repository.ts` → `application/*.service.ts`, with routes as thin adapters.

**New this sprint**: real Supabase client infrastructure (browser/server/admin/proxy factories), a `Database` type generated from the live schema (replacing the Sprint 1A placeholder), real `resolveActor()` against Supabase Auth, dependency-injected audit logging (`AuditLogger`, passed into every service constructor rather than imported directly — required for unit-testability, since the real implementation transitively imports the `server-only`-guarded admin client), and a shared `resolveWebsiteOrganizationId`/`resolveWebsiteByKey` pair used by every content module for website-scoped access control and public-endpoint resolution.

## 2. Files created and changed

- **84 route files** under `app/api/v1/` (80 authenticated + 4 public `/api/v1/public/sites/{websiteKey}/...`), plus `middleware.ts` → renamed to `proxy.ts` (Next.js 16's renamed convention).
- **42 module files** across 12 modules (2 extended from Sprint 1A — `organization`, `access-control` — plus 10 new: `settings`, `master-data`, `cms`, `navigation`, `faq`, `seo`, `forms`, `media`, `audit`, plus the shared `guards`/`auth.schema` split).
- **25 `shared/` files**, including 6 new this sprint (`env.ts`, `browser-client.ts`, `admin-client.ts`, `proxy-client.ts`, `db-error-mapper.ts`, `logging/logger.ts`, `auth/guards.ts`, `organization/resolve-website-organization.ts`, `organization/resolve-website-by-key.ts`) and 3 rewritten (`server-client.ts`, `session.ts`, `types.ts`).
- **12 test files**, 80 tests — added this sprint: shared infra (env, response envelope, error mapping, guards), self-elevation/last-admin/organization-isolation/settings-resolution (Checkpoint 3), CMS lifecycle/redirect-loop/forms-security (Checkpoint 4).
- **`vitest.config.ts`**, `package.json#test` script — no test runner existed before this sprint; the one pre-existing test file (`lib/tours/availability.test.ts`, using `node:test`, incompatible with Vitest's discovery) was converted, same assertions, zero logic changes.
- **13 documentation files** — 3 new this checkpoint (`sprint-1b2-endpoints.md`, `authorization-flow.md`, `sprint-1b2-implementation-report.md`), 5 new playbooks, 2 rewritten playbooks (`create-cms-page.md`, `configure-form.md` — previously raw-SQL, now the real API), plus `api-conventions.md`/`error-codes.md` updated, `sprint-1-endpoints.md` marked historical.

## 3. APIs implemented

See `docs/api/sprint-1b2-endpoints.md` for the complete, current list. Summary: Auth (5), Organization (14), Users/RBAC (10), Settings (3), Master data (16), CMS (15), Navigation (5), FAQ (5), SEO (4), Forms (5), Media (4) — plus the 3 pre-existing Sprint 1A routes, unmodified in shape (only their client-construction internals changed for the now-async `getServerSupabaseClient()`).

## 4. Permissions enforced

Every mutating service method calls `requirePermission`/`requireAnyPermission` before touching its repository — verified by direct count (`grep`), not assumed: every module's `requirePermission` call count is ≥ its mutating-method count, with the sole intentional exception being `FormsService.submitPublic` (the anonymous path, correctly ungated) and the handful of catalog-read methods (`listRoles`, `listPermissions`, `listForms`) that intentionally mirror RLS's own "not secret, any authenticated caller" posture.

New this sprint: `requireWebsiteAccess` is now live-wired into every CMS/navigation/FAQ/SEO/forms/media mutation via `resolveWebsiteOrganizationId` — not previously exercised outside RLS itself.

## 5. Tests added

80 tests across 12 files. Highest-value additions, all against in-memory fakes (no live DB dependency):
- Self-role-elevation denial and last-SUPER_ADMIN protection (`access-control.service.test.ts`)
- Organization/website isolation (`organization.service.test.ts`)
- Settings resolution order, USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > default, at every priority level (`settings.service.test.ts`)
- CMS lifecycle state machine — valid chains, invalid transitions, ARCHIVED terminality, scheduled-vs-immediate publish, permission gating, website isolation (`cms.service.test.ts`)
- SEO redirect-loop rejection — self-redirect, 2-hop, multi-hop, and the negative case (a valid chain is allowed) (`seo.service.test.ts`)
- Forms public-submission security — honeypot, idempotency dedup, server-resolved ids (never client-controlled), tag-stripping (`forms.service.test.ts`)

## 6. Test results

```
pnpm test
Test Files  12 passed (12)
     Tests  80 passed (80)
```

## 7. Build results

```
pnpm exec tsc --noEmit   → 0 errors
pnpm lint                → 0 warnings, 0 errors
pnpm build               → succeeds, 84 API routes + 25 public-site routes, no regressions
```

## 8. Database changes

**None beyond what Sprint 1B.1 already applied and reported.** Live re-verification at the start of Checkpoint 5: `list_migrations` returns the same 18 entries as at the end of Sprint 1B.1 (13 approved migrations + 3 policy files + 2 hardening migrations); live counts are still 47 tables / 47 RLS-enabled / 98 policies / 1 auth user / 1 `SUPER_ADMIN`. No table, column, function, or policy was added, altered, or removed during Sprint 1B.2.

## 9. RLS changes

None. RLS policies are exactly as Sprint 1B.1 left them. This sprint's service-layer `requireWebsiteAccess` check is an *addition* on top of RLS, not a replacement — the two-layer model (`docs/security/authorization-flow.md`) is unchanged.

## 10. Existing frontend compatibility

Zero changes to any public-site page, component, or its mock/seed data (`lib/site-data.ts`, `lib/tours/*`, `lib/mice/*`, `lib/inspiration/*`, `lib/cms/content/homepage.seed.ts`, the webhook-based lead-capture actions) — confirmed by the build output listing the same 25 static/dynamic public-site routes across every checkpoint, unchanged. No admin UI was built (per spec §1 — API layer only this sprint).

## 11. Security risks remaining

Carried forward from Sprint 1B.1, still accurate:
- **No rate limiter** (`RATE_LIMITED` is a reserved, unimplemented `AppErrorCode`) — the most exposed surface without it is the 4 public endpoints, especially the form-submission write. Honeypot/idempotency/payload-cap mitigate but don't replace rate limiting.
- **Single-tenant test coverage** — cross-organization RLS leakage is structurally prevented by design (every query filters through `auth_user_organization_ids()`/`auth_user_website_ids()` at the RLS layer, `resolveWebsiteOrganizationId`/`requireWebsiteAccess` at the service layer) but still not empirically exercised with a second real organization, since one doesn't exist yet.
- **Manual secrets**: `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_DATABASE_URL` remain blank in `.env.local` pending manual entry from the Supabase dashboard, as documented in Sprint 1B.1 — no tool available in any session so far can retrieve them, by design.

New finding from this sprint's security review, low-severity: two nested Zod object shapes in `modules/cms/schemas/cms.schema.ts` (`sectionInputSchema`, `blockInputSchema` — used only inside the bulk `POST /cms/pages/{id}/versions` payload) don't call `.strict()` individually, so an unknown key nested inside one `sections[].blocks[]` entry is silently stripped rather than rejected, unlike every other schema in the codebase. Not a security hole (a stripped field can't execute anything), just a data-hygiene inconsistency against master-prompt §16's "reject unexpected fields" convention — flagged here per this checkpoint's "verification only, do not fix" instruction, left for a future pass.

## 12. Manual setup remaining

Same two items as Sprint 1B.1: (1) `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_DATABASE_URL` need manual entry into `.env.local`; (2) staging/production each need their own Supabase project when that environment is provisioned (master-prompt §5). Nothing new introduced by Sprint 1B.2.

## 13. Deferred work

- `shared/auth/session.ts`'s `getCurrentApplicationUser()`/`resolveActor()` are real, but no admin UI calls them yet — Sprint 1B.2 deliberately built zero UI (per spec §1).
- File upload / Supabase Storage buckets — `modules/media` is metadata-only by explicit instruction; no upload endpoint, no bucket, no fabricated public URL exists.
- Rate limiting (see §11).
- CMS's per-block `config` JSON is validated as "is it an object" at the API boundary, not against each block definition's own `config_schema` — that per-block validation is deferred to whatever renders the block (documented in `modules/cms/domain/types.ts`), matching the existing pattern of `cms_block_definitions.config_schema` being informational for admin-UI form generation, not a runtime gate.
- The minor nested-schema `.strict()` inconsistency noted in §11.

## 14. Recommended Sprint 2 scope

Unchanged from Sprint 1B.1's own recommendation, now with the full backend foundation actually in place to build against: an admin UI consuming this API surface (the natural next step, now that every module has a real, tested service layer behind it), then CRM and Booking Request per `docs/architecture/future-travel-domains.md`, reusing the Forms Foundation built here — Notifications and the Integration Registry return alongside CRM and the first real provider respectively, exactly as scoped in Sprint 1A.2.

---

## Definition of Done — checklist

- [x] Supabase client infrastructure centralized (`shared/supabase/*`) and secure (service-role client `server-only`-guarded, used in exactly 2 documented call sites)
- [x] Environment validation works (lazy, build-safe — `pnpm build` still requires zero env vars)
- [x] Session endpoint works (`GET /auth/session`, never throws for "not logged in")
- [x] Current application user/profile endpoint works (`GET /auth/me`)
- [x] Permission guards work (`requirePermission`/`requireAnyPermission`/`requireActiveMembership`/`requireWebsiteAccess`, all unit-tested)
- [x] Organization APIs work (organizations/brands/websites/business-units/offices/departments/positions, full CRUD)
- [x] Brand and website APIs work (including the domain-uniqueness conflict check, soft-delete)
- [x] User profile and access-control APIs work (self-service + admin variants, self-elevation and last-admin protected)
- [x] System-setting resolution works (5-level priority order, unit-tested at every level)
- [x] Master-data APIs work (8 resources, all reusable across future domains by construction)
- [x] CMS page CRUD and lifecycle work (state machine, unit-tested)
- [x] Public CMS endpoint returns only published content (RLS + redundant application-layer check)
- [x] Navigation APIs work (circular-reference and cross-website-leak guards)
- [x] FAQ APIs work
- [x] SEO metadata and redirects work (redirect-loop detection, canonical dedup, slug history)
- [x] Public form submission works securely (honeypot, payload cap, tag-stripping)
- [x] Form idempotency works (dedup by key, retry-safe)
- [x] Form submissions remain private (no anon read policy; staff-only via `forms.submission.read`)
- [x] Media metadata APIs work without creating buckets
- [x] Critical changes create audit logs (every mutating service, injected `AuditLogger`)
- [x] No service-role key appears in browser code (verified by grep: 3 call sites total, all documented server-only exceptions)
- [x] No secret committed
- [x] Tests cover critical security and business foundation (80 tests, self-elevation/last-admin/isolation/resolution-order/lifecycle/redirect-loop/forms-security)
- [x] TypeScript passes
- [x] Lint passes
- [x] Tests pass
- [x] Production build passes
- [x] Existing public frontend remains operational (unchanged routes across every checkpoint)
- [x] Documentation matches actual code and live database
- [x] No out-of-scope module started (Tour/Flight/Hotel/Cruise/Ticket/Booking/CRM/Payment/Marketing/AI Import/Notifications/Integration Registry — none touched)

**Sprint 1B.2 is complete. Per the stop condition in scope, Sprint 2 has not begun. Awaiting owner and architecture review.**

---

# Appendix: Architecture Review

Documentation only — nothing in this appendix changes code or the live database. Sections 6–9 are explicitly placeholders/proposals for future sprints, not commitments or specs to build against yet.

## A.1 Platform capabilities completed

| Capability | Module(s) | State |
|---|---|---|
| Authentication (session, profile, logout, password reset/update) | `shared/auth`, `/api/v1/auth/*` | Real, against Supabase Auth |
| Authorization (permission + website-scope guards, self-elevation/last-admin protection) | `shared/auth/guards.ts`, `access-control` | Real, unit-tested |
| Organization hierarchy (org/brand/website/business-unit/office/department/position) | `organization` | Full CRUD, extensible per `docs/backend/sprint-1b2-implementation-plan.md`'s multi-brand design notes |
| User & role administration | `access-control` | Full CRUD; account provisioning intentionally routed through Supabase Auth dashboard, not this API |
| Hierarchical settings resolution | `settings` | 5-level priority order, unit-tested at every level |
| Master data (currency/language/country/province/city/destination/product-type/customer-type) | `master-data` | Full CRUD, zero coupling to any business domain |
| CMS (pages, versioned lifecycle, sections, blocks, announcements) | `cms` | Full state machine (`DRAFT→IN_REVIEW→APPROVED→PUBLISHED/SCHEDULED→ARCHIVED`), unit-tested |
| Navigation (menus, hierarchical items) | `navigation` | Cycle-detection and cross-website-leak guards |
| FAQ (categories, entries) | `faq` | Full CRUD + public read |
| SEO (metadata, redirects, slug history) | `seo` | Redirect-loop detection, canonical dedup, automatic slug history |
| Forms (catalog + secure public submission) | `forms` | Honeypot, idempotency, payload cap, tag-stripping |
| Media metadata (folders, assets — no upload) | `media` | Catalog only, see §A.7 |
| Audit logging | `audit`, injected `AuditLogger` | Every mutating service call, append-only at the DB layer |

All of the above sit behind the same `Route → Zod → resolveActor() → requirePermission/requireWebsiteAccess → Repository (RLS) → auditLogger` sequence — no module has a bespoke authorization path.

## A.2 Explicitly deferred domains

| Domain | Deferred since | Returns with |
|---|---|---|
| Tour, Hotel, Cruise, Attraction Ticket, Product Core | Never started | Their own Sprint 2+ migration and module, per `docs/architecture/future-travel-domains.md` |
| Flight | Sprint 1A.2 (`airports` table dropped) | Flight domain's own migration — see §A.8 |
| Supplier, Pricing, Quotation | Never started | Their own future migration |
| Booking, Payment | Never started | Sprint 2, per Volume 00 |
| CRM, Lead Pipeline, Customer 360 | Never started | Sprint 2 — first consumer of the Forms Foundation built in Sprint 1B.2 |
| Marketing Automation, Email Campaigns | Never started | Post-CRM |
| Notifications | Sprint 1A.2 (tables dropped entirely) | Alongside CRM — first event worth alerting someone about |
| Integration Registry | Sprint 1A.2 (tables dropped entirely) | Alongside the first real, credentialed provider — connector *contracts* already exist as dormant TypeScript interfaces (`integrations/{flight,attraction-ticket,email,ai}/contracts/`) |
| AI Import, AI Content Factory | Never started | See §A.9 |
| Admin UI (any screen) | Never started | Explicitly out of Sprint 1B.2 scope — API-only sprint |
| File upload / Storage buckets | Never started | See §A.7 |
| Mobile app, multi-supplier marketplace | Ruled out for V1 | Volume 00 `CLAUDE.md` explicit constraint |

## A.3 Remaining security backlog

Ranked by exposure, not by effort:

1. **No rate limiter.** `RATE_LIMITED` is a reserved `AppErrorCode` with zero enforcement anywhere. The 4 public endpoints (`/api/v1/public/sites/...`) are the exposed surface — see §A.6 for the proposed design.
2. **No CORS/CSRF/security-header configuration.** Deferred since Sprint 1A (`docs/security/security-checklist.md`) — not meaningfully implementable without a live deployed frontend origin to configure against; still true, no live frontend consumes this API yet.
3. **Single-tenant test coverage.** Cross-organization RLS isolation is structurally guaranteed (every query filters through `auth_user_organization_ids()`/`requireWebsiteAccess`) but has never been exercised against a second real organization, because one doesn't exist. Empirical verification is blocked on a second tenant existing, not on missing code.
4. **Manual secrets.** `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_DATABASE_URL` still require manual dashboard entry into `.env.local` — no tool available to any session so far can retrieve them, by design.
5. **Nested-schema validation gap.** `sectionInputSchema`/`blockInputSchema` in `modules/cms/schemas/cms.schema.ts` silently strip unknown nested keys instead of rejecting them (missing `.strict()`), unlike every other schema in the codebase. Data-hygiene inconsistency, not an executable vulnerability.
6. **No Storage-layer security model yet** — moot until buckets exist (§A.7), but signed-URL strategy for `PRIVATE`-visibility media needs to be designed before the first bucket is created, not after.
7. **`role_scopes` remains unenforced** — accepted, documented limitation for single-website V1 (`auth_has_permission()` is scope-blind); revisit once a second website/brand makes scoping meaningful (see §A.5).

## A.4 Technical debt register

| Item | Where | Why it's debt, not a bug |
|---|---|---|
| `is_current` pointer swap is 2 sequential updates, not one transaction | `CmsService.transition` | No RPC/function was added to keep the schema untouched this sprint; a brief zero-current window is accepted over ever risking two |
| No scheduler for `SCHEDULED` CMS versions | `CmsService.publish` | Explicitly out of scope (spec §12); a second manual `publish` call is required when the scheduled time arrives |
| CMS block `config` validated as "is it an object," not against its block definition's own `config_schema` | `modules/cms` | `cms_block_definitions.config_schema` is informational for a future admin-UI form generator, not yet a runtime gate |
| Settings value validation is generic (by `value_type`), not semantic (e.g. currency-code format, IANA timezone validity) | `modules/settings/application/settings.service.ts#validateValueShape` | A per-key validation registry was deliberately not built (master-prompt §36 principle 19 — no concrete need yet) |
| `brands.slug` uniqueness is global, not per-organization | `database/migrations/0004_organization.sql` (pre-existing, Sprint 1A.2) | Documented single-organization-V1 simplification, restated here since Sprint 1B.2 didn't revisit it |
| `form_submissions.assigned_department_id` doesn't exist | `database/migrations/0011_forms.sql` (pre-existing) | Dropped alongside `form_routing_rules` in Sprint 1A.2; add back as one column if routing is needed before CRM ships |
| Nested Zod schemas missing `.strict()` | `modules/cms/schemas/cms.schema.ts` | See §A.3.5 |
| No real file upload path | `modules/media` | See §A.7 |

## A.5 Future extension points

Designed for, not built — each is a seam that exists today specifically so the next sprint doesn't need a rewrite:

- **`AuditLogger` dependency injection** (`modules/audit/domain/types.ts`) — every service takes it as a constructor argument rather than importing `recordAuditLog` directly. A future requirement (e.g. streaming audit events to an external SIEM) is a new implementation of the same function type, not a service-layer change.
- **`resolveWebsiteOrganizationId`/`requireWebsiteAccess`** — already live-enforced per-website access control, ready for a second brand's website with zero service-layer change (create `websites`/`brands` rows, optionally grant narrower `user_website_access`).
- **`media_assets.website_id: null`** — the existing brand-wide-sharing mechanism (no `brand_id` column; resolved via the uploader's organization), ready for cross-website asset reuse under one brand today, without any new column.
- **`role_scopes`** — schema present, unenforced. `auth_has_permission()` becomes scope-aware by extending that one function once a second website/brand makes fine-grained scoping (this-website-only, own-records-only) meaningful.
- **Integration connector contracts** (`integrations/{flight,attraction-ticket,email,ai}/contracts/`) — dormant TypeScript interfaces with zero live callers, written so the first real provider implementation has a fixed shape to conform to rather than inventing one under deadline.
- **`SettingsResolutionContext`** — already accepts `brandId`, currently always `undefined` in practice (single-brand V1). Populating it from an actual brand lookup is additive, not a redesign.
- **Master-data pattern** (`modules/master-data`) — uniform per-resource repository/service/route shape across 8 lookup tables; adding a 9th (e.g. `airports`, when the Flight domain arrives) is a copy of an existing ~40-line block, not a new abstraction.

## A.6 Rate-limiter implementation proposal (design only, no code)

**Problem**: 4 public, unauthenticated endpoints (3 reads, 1 write) have no volumetric protection today. Honeypot/idempotency/payload-cap on the form-submission write mitigate abuse *shape* but not *volume*.

**Proposed enforcement point**: a new check inside `shared/http/handle-route.ts`'s `withRoute`/`withParamsRoute` wrappers, gated to routes under `app/api/v1/public/` (and optionally `/api/v1/auth/password-reset`, the other genuinely anonymous write). Centralizing it in the existing route wrapper means every current and future public route gets it automatically — no per-route opt-in to forget.

**Proposed strategy**: sliding-window or token-bucket counter, keyed on `(ip_address, route)`, with a stricter bucket specifically for `POST .../forms/{formKey}/submissions` than for the read endpoints (writes are more expensive and more attractive to abuse). IP alone is a known-imperfect key (shared NAT, mobile carriers) — acceptable for a first pass; `anonymousSessionId` (already collected on form submissions) is a reasonable secondary signal to combine it with later.

**Proposed storage backend**: Vercel serverless functions don't share in-process memory across invocations, so an in-memory counter (fine for local `pnpm dev`) cannot work in production. Two realistic options, in order of preference:
1. **Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`) — purpose-built for exactly this, works natively with Vercel's edge/serverless runtime, sliding-window and token-bucket algorithms included out of the box. New external dependency, no schema change.
2. **Vercel Edge Config / KV** — viable alternative if the project already standardizes on Vercel infrastructure beyond hosting.

Explicitly **not proposed**: a new Postgres table for rate-limit counters — this would add write load to the primary database for every anonymous request, exactly the kind of load a rate limiter exists to shed, and would be a schema change this sprint is scoped not to make.

**Proposed response contract**: on limit exceeded, return the already-reserved `RATE_LIMITED` (`AppErrorCode`, HTTP 429) with a `Retry-After` header — no new error code needed, `shared/errors/app-error.ts` and `shared/http/response.ts#ERROR_STATUS` already have the entry, just unused.

**Rollout order**: form-submission write first (highest abuse value), then the 3 public reads, then reassess whether authenticated routes need a (much looser) limit too.

## A.7 Storage strategy placeholder

No Supabase Storage bucket exists; `modules/media` is metadata-only by explicit Sprint 1B.2 instruction. When upload is built:

- **Bucket layout**: one bucket per `media_visibility` value (`media-public`, `media-private`) rather than per-website — visibility is already a first-class column, and a single pair of buckets with path-based organization (`{organizationId}/{websiteId|"shared"}/{assetId}.{ext}`) avoids a bucket-per-tenant explosion as brands multiply.
- **Upload flow**: client requests a presigned upload URL from a new server route (server-side, using the service-role client — a third legitimate use of it, alongside audit logging and form submissions), uploads directly to Storage, then calls the *existing* `POST /api/v1/media/assets` with the resulting `storagePath` to register metadata — the metadata API built this sprint needs no change.
- **Signed URLs for `PRIVATE` assets**: resolved at read time by the service layer (never a stored, potentially-stale signed URL column) — consistent with `docs/security/security-model.md`'s existing statement that `storage_path` is "not a public URL... visibility/signing is resolved at read time."
- **Validation**: MIME-type allowlist and file-size ceiling enforced server-side before issuing the presigned URL, not trusted to client-side checks.
- **CDN**: Supabase Storage's own CDN is the default; no additional layer proposed unless a concrete latency need emerges.

## A.8 Flight Hub placeholder

Not scoped in detail — this is a placeholder marking what a future Flight domain needs, not a design to build against yet:

- **Master data**: `airports` (dropped in Sprint 1A.2, explicitly deferred to this domain's own migration — see `docs/backend/sprint-1a2-reduction-report.md` §3) and `airlines` (never existed in any prior approved architecture — confirmed during Sprint 1B.2 Checkpoint 3, see `docs/backend/sprint-1b2-implementation-plan.md`'s scope-lock discussion). Both would follow the exact `modules/master-data` pattern already established (§A.5).
- **Integration**: `integrations/flight/contracts/flight-provider.ts` already defines the interface shape a real flight-search/booking provider would implement — zero live callers today.
- **Product/pricing**: depends on the still-unbuilt Product Core and Pricing domains (§A.2) — Flight is a product type (`product_types.FLIGHT` already seeded) but has no product-instance table yet.
- **Booking integration**: depends on the still-unbuilt Booking domain.

## A.9 AI Publishing Platform placeholder

Not scoped in detail — a placeholder for future content/SEO/publishing automation, explicitly informed by this sprint's AI-automation verification (`docs/security/authorization-flow.md`):

- **What it would consist of**: orchestration logic (deciding what to write, when to publish, which redirects to create) plus a caller that invokes the existing CMS/SEO/FAQ/Forms APIs exactly as documented in `docs/api/sprint-1b2-endpoints.md` — no new privileged path, ever, per the verified finding that no such shortcut exists today.
- **What's still missing for it to run unattended**: (1) a scheduler to fire the second `publish` call for `SCHEDULED` CMS versions (§A.4) — the same gap a human operator has today; (2) if truly autonomous, a service-account-style actor identity (a real `user_profiles` row with a scoped role, e.g. a new `CONTENT_BOT` role holding only `cms.page.create`/`cms.page.update`, never `cms.page.publish` unless deliberately trusted) — this is a data change (seed a role), not a schema or code change; (3) a generation/provenance audit trail — `audit_logs.source` already has a `'system'` value reserved for exactly this, no new column needed.
- **What must never happen**: a bypass of `requirePermission`/`requireWebsiteAccess`/RLS for "trusted" automated callers. An AI agent's actor context should be exactly as constrained as the least-privileged human role it's granted — enforced by the same `ActorContext` mechanism, not a parallel one.

## A.10 Sprint 2 dependency map

```
Sprint 1B.2 foundation (this sprint)
├── access-control (RBAC, users)  ──────────────┐
├── organization (org/brand/website)  ───────────┤
├── settings  ────────────────────────────────┐  │
├── master-data  ─────────────────────────────┤  │
│                                              │  │
├── forms (catalog + public submission)  ──┐   │  │
│                                          │   │  │
├── cms + navigation + faq + seo  ─────┐   │   │  │
│                                      │   │   │  │
└── media (metadata)  ─────────────┐   │   │   │  │
                                   │   │   │   │  │
   Sprint 2 (not started):         │   │   │   │  │
   ├── CRM / Lead Pipeline  ───────┼───┘   │   │  │
   │     (consumes form_submissions        │   │  │
   │      directly; needs user/role        │   │  │
   │      assignment for lead ownership) ──┼───┼───┘
   ├── Notifications  ─────────────────────┘   │
   │     (returns alongside CRM; needs an      │
   │      event source — first CRM action)     │
   ├── Booking Request  ────────────────────────┘
   │     (needs Product Core + Pricing, which
   │      need Master Data's product_types —
   │      already seeded, unblocked)
   ├── Product Core (Tour/Hotel/Cruise/...)  ────► needs media (product imagery),
   │                                               cms (product-adjacent content),
   │                                               seo (product page metadata)
   ├── Flight Hub (§A.8)  ───────────────────────► needs Master Data pattern,
   │                                               Integration Registry
   ├── Integration Registry  ────────────────────► returns with the first real
   │                                               provider (Flight Hub is the
   │                                               most likely first consumer)
   ├── AI Import / AI Publishing (§A.9)  ────────► needs CMS + SEO + Media (all
   │                                               done) + a scheduler (not done)
   └── Admin UI (any screen)  ───────────────────► needs literally every module
                                                     above — the natural first
                                                     Sprint 2 deliverable, since
                                                     the API surface is now complete
```

Reading order: an arrow (`──►` or the tree structure) means "depends on." Everything on the left column (`Sprint 1B.2 foundation`) is done; everything under `Sprint 2` is not started, per this sprint's scope lock.
