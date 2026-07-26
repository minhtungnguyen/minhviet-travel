import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { redirectRuleCreateSchema } from '@/modules/seo/schemas/seo.schema'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'

const listQuerySchema = z.object({ websiteId: uuidSchema })

async function getService() {
  const client = await getServerSupabaseClient()
  return new SeoService(new SupabaseSeoRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  await resolveActor()
  const service = await getService()
  const redirects = await service.listRedirects(parsed.data.websiteId)
  return ok(redirects, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = redirectRuleCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid redirect payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const redirect = await service.createRedirect(actor, parsed.data, requestId)
  return ok(redirect, requestId)
})
