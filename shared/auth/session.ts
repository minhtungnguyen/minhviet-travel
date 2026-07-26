import 'server-only'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import {
  DISABLED_ACCOUNT_STATUSES,
  type AccountStatus,
  type ActorContext,
} from '@/shared/auth/guards'

export type { AccountStatus, ActorContext }
export {
  hasPermission,
  requirePermission,
  requireAnyPermission,
  requireActiveMembership,
  requireWebsiteAccess,
} from '@/shared/auth/guards'

/** Auth-only check (no profile/permission resolution) — used by the password-update route. */
export async function requireAuthenticatedUser() {
  const supabase = await getServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw AppError.unauthenticated()
  }
  return data.user
}

/**
 * Resolves the full actor context for the current request: Supabase Auth
 * session -> `user_profiles` -> `user_organization_memberships` ->
 * `user_roles` -> `role_permissions` -> `user_website_access`. Throws
 * `UNAUTHENTICATED` if there's no session or no application profile,
 * `ACCOUNT_DISABLED` if the profile is suspended/disabled/terminated.
 * Does NOT throw for missing organization membership — see `ActorContext`
 * in `shared/auth/guards.ts`.
 */
export async function resolveActor(): Promise<ActorContext> {
  const supabase = await getServerSupabaseClient()
  const user = await requireAuthenticatedUser()

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('account_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new AppError('INTERNAL_ERROR', 'Failed to resolve application profile')
  }
  if (!profile) {
    throw AppError.unauthenticated('No application profile exists for this account')
  }
  if (DISABLED_ACCOUNT_STATUSES.includes(profile.account_status as AccountStatus)) {
    throw AppError.accountDisabled()
  }

  const { data: membership } = await supabase
    .from('user_organization_memberships')
    .select('organization_id')
    .eq('user_profile_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle()

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('role_id, roles(key)')
    .eq('user_profile_id', user.id)

  const roleIds = (roleRows ?? []).map((r) => r.role_id)
  const roleKeys = (roleRows ?? [])
    .map((r) => r.roles?.key)
    .filter((key): key is string => Boolean(key))

  let permissionKeys: string[] = []
  if (roleIds.length > 0) {
    const { data: permRows } = await supabase
      .from('role_permissions')
      .select('permissions(key)')
      .in('role_id', roleIds)
    permissionKeys = (permRows ?? [])
      .map((r) => r.permissions?.key)
      .filter((key): key is string => Boolean(key))
  }

  const { data: accessRows } = await supabase
    .from('user_website_access')
    .select('website_id')
    .eq('user_profile_id', user.id)
    .eq('status', 'ACTIVE')

  return {
    userId: user.id,
    organizationId: membership?.organization_id ?? null,
    roles: roleKeys,
    permissions: new Set(permissionKeys),
    websiteIds: (accessRows ?? []).map((r) => r.website_id),
    accountStatus: profile.account_status as AccountStatus,
  }
}

/** `resolveActor()` plus the profile fields `/api/v1/auth/me` returns. */
export async function getCurrentApplicationUser() {
  const actor = await resolveActor()
  const supabase = await getServerSupabaseClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_media_id, locale, timezone, account_status, last_login_at, created_at')
    .eq('id', actor.userId)
    .maybeSingle()

  if (error || !profile) {
    throw new AppError('INTERNAL_ERROR', 'Failed to load application profile')
  }
  return { actor, profile }
}
