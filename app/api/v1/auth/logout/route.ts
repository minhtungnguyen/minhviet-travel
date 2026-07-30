import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'

export const POST = withRoute(async (_req: NextRequest, requestId) => {
  const supabase = await getServerSupabaseClient()
  // Captured before signOut() — there is no session left to read from afterward.
  const { data } = await supabase.auth.getUser()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Failed to sign out')
  }
  if (data.user) {
    await recordAuditLog({
      actorUserId: data.user.id,
      action: 'auth.logout',
      entityType: 'auth',
      entityId: data.user.id,
      requestId,
      source: 'admin-ui',
    })
  }
  return ok({ loggedOut: true }, requestId)
})
