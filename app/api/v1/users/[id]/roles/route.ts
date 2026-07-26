import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { assignRoleBodySchema } from '@/modules/access-control/schemas/access-control.schema'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'

async function getService() {
  return new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid user id')
  const actor = await resolveActor()
  const service = await getService()
  const roles = await service.listUserRoles(actor, idResult.data)
  return ok(roles, requestId)
})

export const POST = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid user id')
  const body = await req.json()
  const parsed = assignRoleBodySchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid role assignment payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const userRole = await service.assignRole(actor, { userProfileId: idResult.data, ...parsed.data }, requestId)
  return ok(userRole, requestId)
})
