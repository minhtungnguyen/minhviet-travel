import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { mediaAssetUpdateSchema } from '@/modules/media/schemas/media.schema'
import { MediaService } from '@/modules/media/application/media.service'
import { SupabaseMediaRepository } from '@/modules/media/infrastructure/media.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new MediaService(new SupabaseMediaRepository(client), client, recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid media asset id')
  const actor = await resolveActor()
  const service = await getService()
  const asset = await service.getAsset(actor, idResult.data)
  return ok(asset, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid media asset id')
  const body = await req.json()
  const parsed = mediaAssetUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid media asset payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const asset = await service.updateAsset(actor, idResult.data, parsed.data, requestId)
  return ok(asset, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid media asset id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteAsset(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
