import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { announcementUpdateSchema } from '@/modules/cms/schemas/cms.schema'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid announcement id')
  const body = await req.json()
  const parsed = announcementUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid announcement payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const client = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const announcement = await service.updateAnnouncement(actor, idResult.data, parsed.data, requestId)
  return ok(announcement, requestId)
})
