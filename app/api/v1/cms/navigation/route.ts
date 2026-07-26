import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { navigationMenuCreateSchema } from '@/modules/navigation/schemas/navigation.schema'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'

const listQuerySchema = z.object({ websiteId: uuidSchema })

async function getService() {
  const client = await getServerSupabaseClient()
  return new NavigationService(new SupabaseNavigationRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  await resolveActor()
  const service = await getService()
  const menus = await service.listMenus(parsed.data.websiteId)
  return ok(menus, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = navigationMenuCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid navigation menu payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const menu = await service.createMenu(actor, parsed.data, requestId)
  return ok(menu, requestId)
})
