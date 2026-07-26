import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { faqCategoryCreateSchema } from '@/modules/faq/schemas/faq.schema'
import { FaqService } from '@/modules/faq/application/faq.service'
import { SupabaseFaqRepository } from '@/modules/faq/infrastructure/faq.repository'

const listQuerySchema = z.object({ websiteId: uuidSchema })

async function getService() {
  const client = await getServerSupabaseClient()
  return new FaqService(new SupabaseFaqRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  await resolveActor()
  const service = await getService()
  const categories = await service.listCategories(parsed.data.websiteId)
  return ok(categories, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = faqCategoryCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid FAQ category payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const category = await service.createCategory(actor, parsed.data, requestId)
  return ok(category, requestId)
})
