import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { businessUnitCreateSchema } from '@/modules/organization/schemas/organization.schema'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import { SupabaseOrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'
import { z } from 'zod'

const listQuerySchema = z.object({ organizationId: uuidSchema })

async function getService() {
  return new OrganizationService(new SupabaseOrganizationRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const result = await service.listBusinessUnits(actor, parsed.data.organizationId)
  return ok(result, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = businessUnitCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid business unit payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const businessUnit = await service.createBusinessUnit(actor, parsed.data, requestId)
  return ok(businessUnit, requestId)
})
