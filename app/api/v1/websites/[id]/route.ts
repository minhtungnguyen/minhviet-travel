import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { websiteUpdateSchema } from '@/modules/organization/schemas/organization.schema'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import { SupabaseOrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'

async function getService() {
  return new OrganizationService(new SupabaseOrganizationRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid website id')
  const actor = await resolveActor()
  const service = await getService()
  const website = await service.getWebsite(actor, idResult.data)
  return ok(website, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid website id')
  const body = await req.json()
  const parsed = websiteUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid website payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const website = await service.updateWebsite(actor, idResult.data, parsed.data, requestId)
  return ok(website, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid website id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteWebsite(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
