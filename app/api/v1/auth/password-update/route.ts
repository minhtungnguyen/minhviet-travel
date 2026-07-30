import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { requireAuthenticatedUser } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { passwordUpdateSchema } from '@/shared/auth/auth.schema'
import { recordAuditLog } from '@/modules/audit/application/audit.service'

/**
 * Requires an authenticated session — either an ordinary logged-in user
 * changing their own password, or the temporary session Supabase Auth
 * establishes when a user follows a password-reset email link. Not
 * gated by `resolveActor()`/app permissions: changing your own password
 * is a pure auth operation, not an application-authorization one.
 */
export const POST = withRoute(async (req: NextRequest, requestId) => {
  const user = await requireAuthenticatedUser()

  const body = await req.json()
  const parsed = passwordUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw AppError.validation('Invalid password update payload', { issues: parsed.error.issues })
  }

  const supabase = await getServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword })
  if (error) {
    throw AppError.validation(error.message)
  }

  await recordAuditLog({
    actorUserId: user.id,
    action: 'auth.password.updated',
    entityType: 'auth',
    entityId: user.id,
    requestId,
    source: 'admin-ui',
  })

  return ok({ updated: true }, requestId)
})
