import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { employeeProfileUpdateSchema } from '@/modules/access-control/schemas/access-control.schema'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'

/**
 * "Membership" here covers the employee/org-chart side (department,
 * position, office, manager — `employee_profiles`), distinct from
 * `user_organization_memberships` (which is provisioned only at
 * onboarding, alongside role assignment — see docs/playbooks/
 * invite-new-user.md).
 */
async function getService() {
  return new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid user id')
  const actor = await resolveActor()
  const service = await getService()
  const [employeeProfile, membership] = await Promise.all([
    service.getEmployeeProfile(actor, idResult.data),
    service.getMembership(actor, idResult.data),
  ])
  return ok({ employeeProfile, membership }, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid user id')
  const body = await req.json()
  const parsed = employeeProfileUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid membership payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const employeeProfile = await service.updateEmployeeProfile(actor, idResult.data, parsed.data, requestId)
  return ok(employeeProfile, requestId)
})
