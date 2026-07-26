import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { destinationUpdateSchema } from '@/modules/master-data/schemas/master-data.schema'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'

async function getService() {
  return new MasterDataService(new SupabaseMasterDataRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid destination id')
  await resolveActor()
  const service = await getService()
  const result = await service.getDestination(idResult.data)
  return ok(result, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid destination id')
  const body = await req.json()
  const parsed = destinationUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid destination payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const destination = await service.updateDestination(actor, idResult.data, parsed.data, requestId)
  return ok(destination, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid destination id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteDestination(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
