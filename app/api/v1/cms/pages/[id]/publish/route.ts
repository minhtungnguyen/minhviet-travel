import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { publishVersionSchema } from '@/modules/cms/schemas/cms.schema'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

export const POST = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid CMS page id')
  const body = await req.json().catch(() => ({}))
  const parsed = publishVersionSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid publish payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const client = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const version = await service.publishPage(actor, idResult.data, parsed.data, requestId)
  return ok(version, requestId)
})
