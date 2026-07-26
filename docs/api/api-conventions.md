# API Conventions

All Sprint 1+ backend endpoints live under `/api/v1/`. This document is descriptive of what `shared/http/*` already implements, not aspirational.

## Response envelope

Success (`shared/http/response.ts#ok`):
```json
{ "success": true, "data": {}, "meta": {}, "requestId": "..." }
```

Failure (`shared/http/response.ts#fail`):
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} }, "requestId": "..." }
```

Every route handler is wrapped in `shared/http/handle-route.ts#withRoute` (or, for dynamic `[id]` segments where the wrapper's single-argument shape doesn't fit, the same try/catch inlined — see `app/api/v1/organizations/[id]/route.ts`). Nothing outside `withRoute`/the inlined equivalent ever constructs a raw `NextResponse.json(...)` for an API route — one envelope shape, no exceptions.

## Error codes

See `docs/api/error-codes.md` for the full list and HTTP status mapping (`shared/errors/app-error.ts`, `shared/http/response.ts`'s `ERROR_STATUS`). Route handlers and services throw `AppError`, never a raw `Error`, for anything that should produce a specific client-facing status.

## Validation

Every request body and query-string is parsed through a Zod schema in `modules/<name>/schemas/` before it reaches a service. Schemas use `.strict()` so unexpected fields are rejected (master-prompt §16). List endpoints parse query params through `shared/validation/pagination.ts#paginationQuerySchema` (or an extension of it) rather than hand-rolling `page`/`pageSize`/`sort`/`order`/`search` parsing per route.

## Pagination

`GET` list endpoints accept `page` (default 1), `pageSize` (default 20, max 100), `sort`, `order` (`asc`/`desc`), `search`. Response `data` is `{ items, page, pageSize, total }` (`shared/validation/pagination.ts#PaginatedResult`).

## Authorization

`resolveActor()` (`shared/auth/session.ts`) resolves the current Supabase Auth session into an `ActorContext` (userId, organizationId, roles, permissions, websiteIds) — real, against Supabase Auth + `user_profiles`/`user_organization_memberships`/`user_roles`/`role_permissions`/`user_website_access` as of Sprint 1B.2. Services call `requirePermission(actor, 'module.entity.action')` before any mutation — see `modules/organization/application/organization.service.ts` for the pattern. A missing permission throws `AppError.forbidden()`, mapped to HTTP 403.

Every CMS/navigation/FAQ/SEO/forms/media mutation additionally calls `requireWebsiteAccess(actor, { id, organizationId })` (`shared/auth/guards.ts`), resolving the target website's owning organization via `shared/organization/resolve-website-organization.ts`. This is what makes multi-website access control real today rather than a future intention — see `docs/security/authorization-flow.md`.

`organizationId` on `ActorContext` is nullable: an authenticated user with no active organization membership is a valid state (`requireActiveMembership()` gates routes that need one), not an error condition baked into `resolveActor()` itself.

## Public endpoints

`/api/v1/public/sites/{websiteKey}/...` — genuinely anonymous, no `resolveActor()` call, addressed by a website's `domain` (not its internal id) so a future second brand's website needs zero endpoint-shape changes. RLS is the primary gate; each route additionally re-checks the same conditions in its own query (e.g. `is_current AND status = 'PUBLISHED'` for CMS pages) as defense-in-depth. Only one public endpoint accepts a write: `POST .../forms/{formKey}/submissions`, which is validated, honeypot-checked and idempotency-checked before a service-role client (the one legitimate non-audit use of it) inserts the row — see `docs/database/rls-policy-matrix.md` for why no anon INSERT policy exists on `form_submissions` at all.

## Request IDs

`shared/http/request-id.ts#newRequestId()` generates one UUID per request, present in both the response envelope and every server-side log line touching that request, so a client-reported error can be traced to its exact server-side log entries.

## Platform capability vs. AI orchestration

Every route documented in `docs/api/sprint-1b2-endpoints.md` is the same API surface for a human admin-UI, a script, or a future AI agent — there is no privileged shortcut, no AI-specific table, and no hidden internal endpoint anywhere in this codebase. An AI content/SEO/publishing agent, when built, is a **caller** of these APIs (same Zod validation, same `requirePermission`/`requireWebsiteAccess` checks, same audit trail via `actor_user_id`) — it is not, and must never become, a separate code path that bypasses them. What such an agent *decides* (what to write, when to publish, which redirects to create) is orchestration logic that belongs entirely outside this repository's Sprint 1B.2 scope; what it *calls* to act on those decisions is exactly this API. See `docs/security/authorization-flow.md` for the concrete verification of this claim.

## What's actually implemented vs. documented-only

See `docs/api/sprint-1b2-endpoints.md` for the full, current endpoint surface (79 routes across 12 modules, all real files, all exercised against the live `mv-travel-os-dev` database). `docs/api/sprint-1-endpoints.md` is kept as the historical Sprint 1A snapshot (3 routes) — do not treat it as current.
