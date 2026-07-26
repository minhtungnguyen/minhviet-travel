import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { cmsBlockUpdateSchema } from '@/modules/cms/schemas/cms.schema'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid block id')
  const body = await req.json()
  const parsed = cmsBlockUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid block payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const block = await service.updateBlock(actor, idResult.data, parsed.data, requestId)
  return ok(block, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid block id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteBlock(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
