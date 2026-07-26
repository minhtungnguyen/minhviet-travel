import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'

/**
 * List only — user creation happens exclusively through the Supabase
 * Auth invite flow (manual, via dashboard, per docs/backend/
 * sprint-1b2-implementation-plan.md and Sprint 1B.1's own admin-creation
 * precedent), never through this API. No POST here.
 */
export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = paginationQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
  const result = await service.listUsers(actor, parsed.data)
  return ok(result, requestId)
})
