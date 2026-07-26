import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { mediaFolderCreateSchema } from '@/modules/media/schemas/media.schema'
import { MediaService } from '@/modules/media/application/media.service'
import { SupabaseMediaRepository } from '@/modules/media/infrastructure/media.repository'

const listQuerySchema = z.object({ websiteId: uuidSchema.optional() })

async function getService() {
  const client = await getServerSupabaseClient()
  return new MediaService(new SupabaseMediaRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const folders = await service.listFolders(actor, parsed.data.websiteId)
  return ok(folders, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = mediaFolderCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid media folder payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const folder = await service.createFolder(actor, parsed.data, requestId)
  return ok(folder, requestId)
})
