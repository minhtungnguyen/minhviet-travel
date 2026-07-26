import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { navigationMenuUpdateSchema } from '@/modules/navigation/schemas/navigation.schema'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new NavigationService(new SupabaseNavigationRepository(client), client, recordAuditLog)
}

export const GET = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid navigation menu id')
  await resolveActor()
  const service = await getService()
  const menu = await service.getMenu(idResult.data)
  return ok(menu, requestId)
})

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid navigation menu id')
  const body = await req.json()
  const parsed = navigationMenuUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid navigation menu payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const menu = await service.updateMenu(actor, idResult.data, parsed.data, requestId)
  return ok(menu, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid navigation menu id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteMenu(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
