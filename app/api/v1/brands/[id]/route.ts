import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { brandUpdateSchema } from '@/modules/organization/schemas/organization.schema'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import { SupabaseOrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'

async function getService() {
  return new OrganizationService(new SupabaseOrganizationRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid brand id')
  const actor = await resolveActor()
  const service = await getService()
  const brand = await service.getBrand(actor, idResult.data)
  return ok(brand, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid brand id')
  const body = await req.json()
  const parsed = brandUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid brand payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const brand = await service.updateBrand(actor, idResult.data, parsed.data, requestId)
  return ok(brand, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid brand id')
  const actor = await resolveActor()
  const service = await getService()
  const brand = await service.archiveBrand(actor, idResult.data, requestId)
  return ok(brand, requestId)
})
