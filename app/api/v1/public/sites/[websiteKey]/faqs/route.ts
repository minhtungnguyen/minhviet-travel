import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { localeSchema } from '@/shared/validation/common'
import { resolveWebsiteByKey } from '@/shared/organization/resolve-website-by-key'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { FaqService } from '@/modules/faq/application/faq.service'
import { SupabaseFaqRepository } from '@/modules/faq/infrastructure/faq.repository'

const querySchema = z.object({ locale: localeSchema.default('vi') })

export const GET = withParamsRoute<{ websiteKey: string }>(async (req: NextRequest, { websiteKey }, requestId) => {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })

  const client = await getServerSupabaseClient()
  const website = await resolveWebsiteByKey(client, websiteKey)
  if (website.status !== 'ACTIVE') throw AppError.notFound('Website', websiteKey)

  const service = new FaqService(new SupabaseFaqRepository(client), client, recordAuditLog)
  const result = await service.getPublicFaqs(website.id, parsed.data.locale)
  return ok(result, requestId)
})
