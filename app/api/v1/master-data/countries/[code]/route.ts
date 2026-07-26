import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { countryUpdateSchema } from '@/modules/master-data/schemas/master-data.schema'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'

export const PATCH = withParamsRoute<{ code: string }>(async (req: NextRequest, { code }, requestId) => {
  const body = await req.json()
  const parsed = countryUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid country payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = new MasterDataService(new SupabaseMasterDataRepository(await getServerSupabaseClient()), recordAuditLog)
  const country = await service.updateCountry(actor, code, parsed.data, requestId)
  return ok(country, requestId)
})
