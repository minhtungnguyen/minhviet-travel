import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { localeSchema, uuidSchema } from '@/shared/validation/common'
import { destinationCreateSchema } from '@/modules/master-data/schemas/master-data.schema'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'

const listQuerySchema = z.object({
  locale: localeSchema.default('vi'),
  parentId: uuidSchema.optional(),
})

async function getService() {
  return new MasterDataService(new SupabaseMasterDataRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  await resolveActor()
  const service = await getService()
  const destinations = await service.listDestinations(parsed.data.locale, parsed.data.parentId)
  return ok(destinations, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = destinationCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid destination payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const destination = await service.createDestination(actor, parsed.data, requestId)
  return ok(destination, requestId)
})
