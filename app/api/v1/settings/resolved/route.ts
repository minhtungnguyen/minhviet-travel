import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'

const querySchema = z.object({ websiteId: uuidSchema.optional() })

/**
 * Resolves every setting for the current actor's context in one pass:
 * USER (actor.userId) > WEBSITE (?websiteId, if given) > BRAND (not yet
 * resolved — see module header) > ORGANIZATION (actor.organizationId) >
 * GLOBAL > definition default.
 */
export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = new SettingsService(new SupabaseSettingsRepository(await getServerSupabaseClient()), recordAuditLog)
  const resolved = await service.resolveAll({
    userId: actor.userId,
    organizationId: actor.organizationId ?? undefined,
    websiteId: parsed.data.websiteId,
  })
  return ok(resolved, requestId)
})
