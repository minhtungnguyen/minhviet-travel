import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { cmsSectionCreateSchema } from '@/modules/cms/schemas/cms.schema'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid CMS page id')
  const actor = await resolveActor()
  const service = await getService()
  const sections = await service.listSections(actor, idResult.data)
  return ok(sections, requestId)
})

export const POST = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid CMS page id')
  const body = await req.json()
  const parsed = cmsSectionCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid section payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const section = await service.createSection(actor, idResult.data, parsed.data.sectionKey, parsed.data.position, requestId)
  return ok(section, requestId)
})
