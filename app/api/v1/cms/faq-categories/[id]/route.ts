import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { faqCategoryUpdateSchema } from '@/modules/faq/schemas/faq.schema'
import { FaqService } from '@/modules/faq/application/faq.service'
import { SupabaseFaqRepository } from '@/modules/faq/infrastructure/faq.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new FaqService(new SupabaseFaqRepository(client), client, recordAuditLog)
}

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid FAQ category id')
  const body = await req.json()
  const parsed = faqCategoryUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid FAQ category payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const category = await service.updateCategory(actor, idResult.data, parsed.data, requestId)
  return ok(category, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid FAQ category id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteCategory(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
