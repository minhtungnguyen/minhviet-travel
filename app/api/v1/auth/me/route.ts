import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { getCurrentApplicationUser } from '@/shared/auth/session'

/**
 * Throws UNAUTHENTICATED/ACCOUNT_DISABLED via `getCurrentApplicationUser()`
 * (which wraps `resolveActor()`) — unlike GET /auth/session, "who am I"
 * has no sensible 200 response without a real identity.
 */
export const GET = withRoute(async (_req: NextRequest, requestId) => {
  const { actor, profile } = await getCurrentApplicationUser()
  return ok(
    {
      userId: actor.userId,
      organizationId: actor.organizationId,
      roles: actor.roles,
      permissions: Array.from(actor.permissions),
      websiteIds: actor.websiteIds,
      profile,
    },
    requestId,
  )
})
