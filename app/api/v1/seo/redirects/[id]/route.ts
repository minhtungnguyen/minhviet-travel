import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { redirectRuleUpdateSchema } from '@/modules/seo/schemas/seo.schema'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new SeoService(new SupabaseSeoRepository(client), client, recordAuditLog)
}

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid redirect id')
  const body = await req.json()
  const parsed = redirectRuleUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid redirect payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const redirect = await service.updateRedirect(actor, idResult.data, parsed.data, requestId)
  return ok(redirect, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid redirect id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteRedirect(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
