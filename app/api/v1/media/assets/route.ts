import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { mediaAssetCreateSchema } from '@/modules/media/schemas/media.schema'
import { MediaService } from '@/modules/media/application/media.service'
import { SupabaseMediaRepository } from '@/modules/media/infrastructure/media.repository'

const listQuerySchema = paginationQuerySchema.extend({ websiteId: uuidSchema.optional(), folderId: uuidSchema.optional() })

async function getService() {
  const client = await getServerSupabaseClient()
  return new MediaService(new SupabaseMediaRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const result = await service.listAssets(actor, parsed.data.websiteId, parsed.data, parsed.data.folderId)
  return ok(result, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = mediaAssetCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid media asset payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const asset = await service.createAsset(actor, parsed.data, requestId)
  return ok(asset, requestId)
})
