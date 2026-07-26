import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { localeSchema, uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { seoMetadataPutSchema } from '@/modules/seo/schemas/seo.schema'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'

const getQuerySchema = z.object({ websiteId: uuidSchema, locale: localeSchema.default('vi') })

async function getService() {
  const client = await getServerSupabaseClient()
  return new SeoService(new SupabaseSeoRepository(client), client, recordAuditLog)
}

export const GET = withParamsRoute<{ entityType: string; entityId: string }>(
  async (req: NextRequest, { entityType, entityId }, requestId) => {
    const parsed = getQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
    if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
    await resolveActor()
    const service = await getService()
    const metadata = await service.getMetadata(parsed.data.websiteId, entityType, entityId, parsed.data.locale)
    return ok(metadata, requestId)
  },
)

export const PUT = withParamsRoute<{ entityType: string; entityId: string }>(
  async (req: NextRequest, { entityType, entityId }, requestId) => {
    const body = await req.json()
    const parsed = seoMetadataPutSchema.safeParse(body)
    if (!parsed.success) throw AppError.validation('Invalid SEO metadata payload', { issues: parsed.error.issues })
    const actor = await resolveActor()
    const service = await getService()
    const metadata = await service.putMetadata(actor, entityType, entityId, parsed.data, requestId)
    return ok(metadata, requestId)
  },
)
