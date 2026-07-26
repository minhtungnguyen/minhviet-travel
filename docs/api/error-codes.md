# Error Codes

Source of truth: `shared/errors/app-error.ts` (`AppErrorCode`) and `shared/http/response.ts` (`ERROR_STATUS`).

| Code | HTTP status | When to use |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod parse failure on body/query/params. `details.issues` carries the Zod issue array. Also used for business-rule violations Zod can't express (redirect loops, cross-website references — see `SeoService`/`NavigationService`). |
| `UNAUTHENTICATED` | 401 | No valid Supabase Auth session, or no `user_profiles` row exists for the session (`resolveActor()`). |
| `ACCOUNT_DISABLED` | 401 | `user_profiles.account_status` is `SUSPENDED`/`DISABLED`/`TERMINATED` (`resolveActor()`). |
| `FORBIDDEN` | 403 | Session valid, but `requirePermission()`/`requireAnyPermission()` failed, or the actor doesn't own the resource in a self-service context, or a self-elevation attempt (`AccessControlService.assignRole`/`revokeRole` reject the actor's own id outright). |
| `MEMBERSHIP_REQUIRED` | 403 | Actor is authenticated but has no ACTIVE `user_organization_memberships` row (`requireActiveMembership()`) — a real, valid state, not an auth failure. |
| `WEBSITE_ACCESS_DENIED` | 403 | Actor's organization doesn't own the target website and no explicit `user_website_access` grant exists (`requireWebsiteAccess()` — used by every CMS/navigation/FAQ/SEO/forms/media mutation via `resolveWebsiteOrganizationId`). |
| `NOT_FOUND` | 404 | Entity id doesn't resolve to a row (or resolves to a soft-deleted one). |
| `CONFLICT` | 409 | Unique constraint would be violated at the business level (e.g. `websites.domain`, a form's `idempotencyKey`... no — idempotency returns the existing row instead of erroring, see `docs/playbooks/configure-form.md`), or a state-machine transition is invalid (`CmsService` lifecycle), or removing the last active `SUPER_ADMIN`. |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds a configured limit. Actually enforced for form submissions (`payload` capped at 20,000 bytes, `PublicFormSubmissionInput`); media upload has no size limit yet — no upload path exists at all (Sprint 1B.2 is metadata-only, no Storage bucket). |
| `RATE_LIMITED` | 429 | Reserved for the rate-limit extension point (master-prompt §17/§18) — still no limiter implemented as of Sprint 1B.2. Public endpoints (`/api/v1/public/*`) are the most exposed surface without it — see `docs/security/security-checklist.md`. |
| `INTERNAL_ERROR` | 500 | Anything unexpected. The client never sees the real message — `shared/errors/db-error-mapper.ts` logs the raw Postgres error server-side and `shared/http/response.ts#fail()` unconditionally strips `details` for this code so a raw SQL error/code can never reach a client even if a repository attached one by mistake. |

## Adding a new code

Add it to `AppErrorCode` in `shared/errors/app-error.ts` and to `ERROR_STATUS` in `shared/http/response.ts` in the same change — the TypeScript compiler enforces this (`ERROR_STATUS` is typed `Record<AppErrorCode, number>`, so a missing entry is a type error, not a runtime surprise).
