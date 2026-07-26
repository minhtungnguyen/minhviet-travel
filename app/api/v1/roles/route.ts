import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'

/** Second reference route (see app/api/v1/organizations/route.ts for the annotated version). */
export const GET = withRoute(async (_req: NextRequest, requestId) => {
  await resolveActor() // still requires an authenticated session, even though listRoles() itself doesn't take an actor
  const service = new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
  const roles = await service.listRoles()
  return ok(roles, requestId)
})
