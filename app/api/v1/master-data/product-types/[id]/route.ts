import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { productTypeUpdateSchema } from '@/modules/master-data/schemas/master-data.schema'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid product type id')
  const body = await req.json()
  const parsed = productTypeUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid product type payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = new MasterDataService(new SupabaseMasterDataRepository(await getServerSupabaseClient()), recordAuditLog)
  const productType = await service.updateProductType(actor, idResult.data, parsed.data, requestId)
  return ok(productType, requestId)
})
