import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { languageCreateSchema } from '@/modules/master-data/schemas/master-data.schema'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'

async function getService() {
  return new MasterDataService(new SupabaseMasterDataRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withRoute(async (_req: NextRequest, requestId) => {
  await resolveActor()
  const service = await getService()
  return ok(await service.listLanguages(), requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = languageCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid language payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const language = await service.createLanguage(actor, parsed.data, requestId)
  return ok(language, requestId)
})
