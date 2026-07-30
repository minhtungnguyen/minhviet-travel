# Authorization Flow

Every `/api/v1/*` request (except the 4 genuinely public `/api/v1/public/sites/{websiteKey}/...` reads and the one public form-submission write) goes through the same sequence, with no shortcut for any caller — human admin UI, script, or future AI agent:

```
Route Handler
  -> Zod schema.safeParse(body/query/params)   [shared validation, .strict()]
  -> resolveActor()                             [shared/auth/session.ts]
  -> Service method
       -> requirePermission(actor, 'module.entity.action')   [shared/auth/guards.ts]
       -> requireWebsiteAccess(actor, { id, organizationId }) [content mutations only]
       -> Repository (Supabase client bound to the actor's session — RLS applies)
       -> auditLogger(...)                       [service-role client — the one documented bypass]
  -> ok(data, requestId) / fail(error, requestId)
```

## `resolveActor()` — what it actually resolves

`shared/auth/session.ts#resolveActor()` reads the Supabase Auth session from the request-bound cookie client, then queries (in order) `user_profiles` (throws `ACCOUNT_DISABLED` if suspended/disabled/terminated), `user_organization_memberships` (nullable — no active membership is a valid state, not an error), `user_roles` joined to `roles`, `role_permissions` joined to `permissions`, and `user_website_access`. The result — `ActorContext` — is the single object every service method receives; nothing downstream re-queries Supabase Auth.

## Two independent gates, not one

1. **Service-layer permission check** (`requirePermission`/`requireAnyPermission`) — coarse: "does this actor hold this permission key, at any scope."
2. **Row Level Security** (`database/policies/`) — the backstop. Even a service-layer bug that skipped `requirePermission` would still be blocked at the database, because the Supabase client used for every ordinary mutation is bound to the actor's session, not the service role.

Verified live in Sprint 1B.1 (5-identity RLS test matrix) and re-confirmed structurally in Sprint 1B.2: `grep`ing the entire `modules/`/`app/api/` tree for `admin-client`/`SUPABASE_SERVICE_ROLE_KEY` usage returns exactly three call sites — `modules/audit/application/audit.service.ts` (writing `audit_logs`, which has no INSERT policy for any authenticated role by design) and the one public form-submission route (`form_submissions` has no anon INSERT policy by design) — plus `shared/env.ts`/`shared/supabase/admin-client.ts` themselves, where the function is defined. No other module, route, or "internal" path touches it.

**Backend Foundation sprint (auth/RBAC UI) update:** two more narrowly-scoped exceptions were added, both structurally the same shape as the three above (RLS cannot express the check, so the service-role client is the documented bypass):
4. `modules/access-control/infrastructure/auth-email-lookup.ts` — reads `auth.users.email` by id via the Supabase Admin API, used only by the Admin Shell's Users list/detail pages to display an email next to a `user_profiles` row. No RLS policy can grant this because Postgres's `auth` schema isn't exposed to ordinary authenticated roles at all; the caller only ever looks up ids it already resolved through a permission-gated `user_profiles` query, never used to enumerate or search identities on its own.
5. `modules/audit/application/audit.service.ts#recordSecurityEvent` — same append-only, service-role-only write pattern as `recordAuditLog`, for `security_events` (failed logins etc.) instead of `audit_logs`.

## Website-level isolation

`requireWebsiteAccess(actor, website)` (used by every CMS/navigation/FAQ/SEO/forms/media mutation) passes when either:
- `website.organizationId === actor.organizationId` (organization-wide access — the default for any org member today, mirroring `auth_user_website_ids()` at the RLS layer), or
- `website.id` appears in `actor.websiteIds` (an explicit `user_website_access` grant — for a narrower-scoped user, e.g. a future contractor).

`website.organizationId` is resolved server-side via `shared/organization/resolve-website-organization.ts` (a `websites -> brands -> organization_id` join) — never trusted from the request. This is what makes a second brand's website (a future Minh Viet Booking, MIVIGO, Checkin Cat Ba, Checkin Nha Trang, ...) safe to add without any service-layer change: create the `websites`/`brands` rows, optionally grant narrower `user_website_access`, and every existing mutation already enforces the right boundary.

## Self-elevation and last-admin protections

`AccessControlService.assignRole`/`revokeRole` reject `input.userProfileId === actor.userId` outright — an admin can grant or revoke *any other* user's role, never their own, regardless of what permission they hold. `revokeRole` additionally blocks removing `SUPER_ADMIN` from its last active holder (`countActiveSuperAdmins() <= 1` → `CONFLICT`). Both are unit-tested (`modules/access-control/application/access-control.service.test.ts`) against an in-memory fake repository, independent of the live database.

## AI-automation readiness — verified, not assumed

This section exists because Sprint 1B.2's owner explicitly asked for it to be checked, not built. Findings:

- **No privileged shortcut exists.** Every route in `docs/api/sprint-1b2-endpoints.md` runs through the exact sequence above. There is no second code path, no "service account" bypass beyond the two documented service-role exceptions (both narrowly scoped to what RLS itself cannot express), and no undocumented internal endpoint. A future AI agent calling these APIs is bound by the identical Zod validation, permission checks, and audit trail as a human using an eventual admin UI.
- **No AI-specific table exists.** The live schema is still exactly the 47 tables approved in Sprint 1B.1 (re-verified via `list_migrations`/live counts at the start of Sprint 1B.2 Checkpoint 5 — zero new migrations since). Nothing was added for "AI-generated content" tracking, prompts, or agent state.
- **CMS, SEO, FAQ, and the full publish lifecycle are automatable entirely through documented APIs today**: create a page, create a version (optionally with its whole section/block tree in one call — a deliberate ergonomic choice for both a human admin UI and a bulk content generator, not an AI-specific feature), submit for review, approve, publish, attach SEO metadata, add FAQs — every step is a plain authenticated `POST`/`PUT`/`PATCH` call, gated the same way as everything else. The only step that is *not* API-automatable by design is provisioning a new human user (`docs/playbooks/invite-new-user.md` — deliberately routed through the Supabase Auth dashboard, not this API, so no code path can mint a session for an unapproved identity).
- **Public endpoints and anonymous abuse**: the 3 public read endpoints are unauthenticated `GET`s backed by RLS with a second, redundant application-layer filter (defense in depth, not reliance on RLS alone). The 1 public write endpoint (`POST .../forms/{formKey}/submissions`) has a honeypot, a payload size cap (20,000 bytes), idempotency-key deduplication, and tag-stripping on free-text fields — all enforced before the service-role client is ever touched. What remains a genuinely open gap, unchanged from Sprint 1B.1's own risk list: no rate limiter exists yet (`RATE_LIMITED` is a reserved, unimplemented `AppErrorCode`) — this is the one honest exposure against high-volume anonymous abuse (spam floods, brute-force enumeration via the public endpoints), tracked in `docs/security/security-checklist.md`, not silently omitted from this report.

**What is explicitly out of scope here, by design**: *deciding* what content to write, when to publish it, or which redirect to create is orchestration logic — it does not live in this repository, and Sprint 1B.2 does not attempt to build it. This document verifies that when such orchestration exists (AI-driven or otherwise), it has nothing to plug into except the same audited, permissioned, RLS-backed API surface everything else uses.
