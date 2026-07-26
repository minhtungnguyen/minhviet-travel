import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import { organizationCreateSchema } from '@/modules/organization/schemas/organization.schema'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import { SupabaseOrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'

/**
 * Reference implementation of the Route Handler -> Validation ->
 * Authorization -> Service -> Repository flow (master-prompt §14),
 * wired to the live `mv-travel-os-dev` project as of Sprint 1B.2. Every
 * other /api/v1 route follows this exact shape.
 */
async function getService() {
  return new OrganizationService(new SupabaseOrganizationRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = paginationQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  }
  const actor = await resolveActor()
  const service = await getService()
  const result = await service.listOrganizations(actor, parsed.data)
  return ok(result, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = organizationCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw AppError.validation('Invalid organization payload', { issues: parsed.error.issues })
  }
  const actor = await resolveActor()
  const service = await getService()
  const organization = await service.createOrganization(actor, parsed.data, requestId)
  return ok(organization, requestId)
})
