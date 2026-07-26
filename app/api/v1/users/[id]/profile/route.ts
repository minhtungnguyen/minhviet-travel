import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { userProfileUpdateSchema } from '@/modules/access-control/schemas/access-control.schema'
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
  const user = await service.getUser(actor, idResult.data)
  return ok(user, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid user id')
  const body = await req.json()
  const parsed = userProfileUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid profile payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const user = await service.updateUserProfile(actor, idResult.data, parsed.data, requestId)
  return ok(user, requestId)
})
