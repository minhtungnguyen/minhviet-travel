import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { navigationItemUpdateSchema } from '@/modules/navigation/schemas/navigation.schema'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new NavigationService(new SupabaseNavigationRepository(client), client, recordAuditLog)
}

export const PATCH = withParamsRoute<{ itemId: string }>(async (req: NextRequest, { itemId }, requestId) => {
  const idResult = uuidSchema.safeParse(itemId)
  if (!idResult.success) throw AppError.validation('Invalid navigation item id')
  const body = await req.json()
  const parsed = navigationItemUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid navigation item payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const item = await service.updateItem(actor, idResult.data, parsed.data, requestId)
  return ok(item, requestId)
})

export const DELETE = withParamsRoute<{ itemId: string }>(async (_req, { itemId }, requestId) => {
  const idResult = uuidSchema.safeParse(itemId)
  if (!idResult.success) throw AppError.validation('Invalid navigation item id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteItem(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
