import { AppError } from '@/shared/errors/app-error'

/**
 * Pure authorization logic — deliberately has NO Supabase or `server-only`
 * dependency so it's unit-testable without a live database or a Next.js
 * server runtime (`server-only` throws unconditionally on plain import
 * outside Next's webpack aliasing). `shared/auth/session.ts` re-exports
 * everything here and adds the DB-touching `resolveActor()` seam.
 */

export type AccountStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'TERMINATED'

/**
 * Contract for the authenticated actor a request is running as. Every
 * module's application-layer service method takes an `ActorContext` as
 * its first argument — this is how authorization is enforced at the
 * service layer (master-prompt §17) rather than only in route handlers
 * or RLS.
 *
 * `organizationId` is nullable: an authenticated user with no ACTIVE
 * `user_organization_memberships` row is a real, valid state (exercised
 * directly in Sprint 1B.1's RLS test matrix, scenario 2) — not an error
 * on its own. Routes that require membership call `requireActiveMembership`
 * explicitly.
 */
export type ActorContext = {
  userId: string
  organizationId: string | null
  /** Role keys the actor holds, e.g. ["SALES", "MARKETING"]. */
  roles: string[]
  /** Fully-qualified permission keys the actor holds, e.g. "cms.page.publish". */
  permissions: Set<string>
  /** Website ids the actor has an explicit `user_website_access` grant for. */
  websiteIds: string[]
  accountStatus: AccountStatus
}

export const DISABLED_ACCOUNT_STATUSES: AccountStatus[] = ['SUSPENDED', 'DISABLED', 'TERMINATED']

export function hasPermission(actor: ActorContext, permission: string): boolean {
  return actor.permissions.has(permission)
}

export function requirePermission(actor: ActorContext, permission: string): void {
  if (!hasPermission(actor, permission)) {
    throw new AppError('FORBIDDEN', `Missing permission: ${permission}`)
  }
}

export function requireAnyPermission(actor: ActorContext, permissions: string[]): void {
  if (!permissions.some((permission) => hasPermission(actor, permission))) {
    throw new AppError('FORBIDDEN', `Missing one of: ${permissions.join(', ')}`)
  }
}

export function requireActiveMembership(actor: ActorContext): void {
  if (!actor.organizationId) {
    throw AppError.membershipRequired()
  }
}

/**
 * Mirrors `auth_user_website_ids()` (database/policies/0001_helper_functions.sql)
 * at the service layer: access is organization-wide (the website's owning
 * organization matches the actor's) OR an explicit `user_website_access`
 * grant exists. Callers resolve `website.organizationId` themselves
 * (via the website's brand).
 */
export function requireWebsiteAccess(actor: ActorContext, website: { id: string; organizationId: string }): void {
  const orgWide = actor.organizationId !== null && actor.organizationId === website.organizationId
  const explicitGrant = actor.websiteIds.includes(website.id)
  if (!orgWide && !explicitGrant) {
    throw AppError.websiteAccessDenied()
  }
}
