import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { localeSchema } from '@/shared/validation/common'
import { resolveWebsiteByKey } from '@/shared/organization/resolve-website-by-key'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

const querySchema = z.object({ locale: localeSchema.default('vi') })

/**
 * Genuinely anonymous — no `resolveActor()` call. RLS (public_read_pages_
 * with_published_version / public_read_published_versions) is the real
 * gate; this route's own `findPublishedPage` query additionally requires
 * `is_current AND status = 'PUBLISHED'` so unpublished content can never
 * leak even if a policy were ever misconfigured (defense in depth,
 * matching the two-layer model in docs/security/security-model.md).
 */
export const GET = withParamsRoute<{ websiteKey: string; slug: string }>(
  async (req: NextRequest, { websiteKey, slug }, requestId) => {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
    if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })

    const client = await getServerSupabaseClient()
    const website = await resolveWebsiteByKey(client, websiteKey)
    if (website.status !== 'ACTIVE') throw AppError.notFound('Website', websiteKey)

    const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
    const result = await service.getPublicPage(website.id, parsed.data.locale, slug)
    return ok(result, requestId)
  },
)
