import { withParamsRoute } from '@/shared/http/handle-route'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'

export const DELETE = withParamsRoute<{ id: string; roleId: string }>(async (_req, { id, roleId }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  const roleIdResult = uuidSchema.safeParse(roleId)
  if (!idResult.success || !roleIdResult.success) throw AppError.validation('Invalid user or role id')
  const actor = await resolveActor()
  const service = new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
  await service.revokeRole(actor, { userProfileId: idResult.data, roleId: roleIdResult.data }, requestId)
  return ok({ revoked: true }, requestId)
})
