# Security Model

## Authentication

Supabase Auth is the only identity/password authority (master-prompt §8.2). `user_profiles.id` is a foreign key to `auth.users.id`, never an independently-generated id — see `database/migrations/0005_identity_and_rbac.sql`. No password, token, or session data is ever stored in an application table.

## Authorization — two layers, both real

1. **Service layer**: every mutating service method calls `requirePermission(actor, 'module.entity.action')` (`shared/auth/session.ts`) before touching the repository. See `modules/organization/application/organization.service.ts` for the pattern every other module's service follows.
2. **Row Level Security**: every table has RLS enabled (`database/policies/`), documented per-table in `docs/database/rls-policy-matrix.md`. RLS is the backstop — it still blocks an unauthorized row-level read/write even if a service method's permission check were ever missing or wrong.

Neither layer alone is trusted as "the" authorization boundary (master-prompt §17: "Authorization must be enforced at: Database policy level..., Service level, API level").

**Live-verified in Sprint 1B.1** (not just asserted from reading the SQL): all 47 tables confirmed RLS-enabled against the deployed `mv-travel-os-dev` database; a 5-identity test matrix (anonymous, authenticated-no-membership, org-member-no-admin-permission, SUPER_ADMIN, service_role) was run directly against the live database, including negative tests (self-role-elevation, cross-permission writes, direct audit-log tampering) — full results in `docs/backend/sprint-1b1-database-deployment-report.md`. One design point surfaced and reviewed: `auth_has_permission()`/`auth_user_organization_ids()`/`auth_user_website_ids()` are `SECURITY DEFINER` and callable by `anon`/`authenticated` via PostgREST RPC — this is intentional, since RLS policies call these functions directly in their `USING`/`WITH CHECK` clauses; revoking `EXECUTE` would break every policy that depends on them. Each function only ever resolves data reachable to the *caller's own* `auth.uid()` (never accepts a target user id), so exposing it as an RPC carries no privilege-escalation risk beyond what the function already grants inside a policy.

## Secrets

Never stored in an ordinary table column. See `docs/security/secret-management.md`.

## Public vs. internal data

`docs/database/rls-policy-matrix.md` documents, table by table, exactly what an unauthenticated visitor can read. The rule of thumb: public website content is gated on `status = 'ACTIVE'`/`'PUBLISHED'` + non-deleted (master-prompt §12); anything with a name suggesting internal operations (RBAC, audit, media folders) has no anon policy at all. Notifications and the Integration Registry aren't in this picture at all — both were deferred entirely in Sprint 1A.2 (no tables, no policies to write).

## Input validation

Every API input is parsed through a `.strict()` Zod schema (`modules/*/schemas/`) before reaching a service — unexpected fields are rejected outright, not silently dropped or silently accepted (master-prompt §16).

## CMS content is never raw HTML

`cms_blocks.config` is structured JSON rendered by a fixed set of block components (`cms_block_definitions.key`) — never `dangerouslySetInnerHTML` on admin-authored content, per master-prompt §8.7. This is a rendering-layer rule (enforced when the CMS block renderer is built in Sprint 1B/2), noted here so it isn't lost between the schema design and the eventual React implementation.

## Audit logging

`audit_logs`/`audit_log_changes`/`security_events` are append-only: RLS grants `SELECT` only to `audit.read` holders, no `INSERT`/`UPDATE`/`DELETE` policy exists for any role, and a `forbid_mutation()` trigger (`database/migrations/0001_extensions_and_helpers.sql`) raises on any `UPDATE`/`DELETE` attempt regardless of grants. Writes happen exclusively through the server-side audit logger using the service role (bypasses RLS by Supabase design, the only place that's an intended bypass).

## Rate limiting, CSRF, security headers

Extension points only in Sprint 1A — master-prompt §17 lists these as requirements, but none has a concrete implementation yet (no live deployment to configure headers/CSRF against). Tracked as Sprint 1B work in `docs/security/security-checklist.md`.
