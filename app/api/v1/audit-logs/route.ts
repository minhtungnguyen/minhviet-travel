import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import { AuditQueryService } from '@/modules/audit/application/audit-query.service'
import { SupabaseAuditQueryRepository } from '@/modules/audit/infrastructure/audit-query.repository'

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = paginationQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = new AuditQueryService(new SupabaseAuditQueryRepository(await getServerSupabaseClient()))
  const result = await service.listAuditLogs(actor, parsed.data)
  return ok(result, requestId)
})
