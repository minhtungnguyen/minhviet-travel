import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { formUpdateSchema } from '@/modules/forms/schemas/forms.schema'
import { FormsService } from '@/modules/forms/application/forms.service'
import { SupabaseFormsRepository } from '@/modules/forms/infrastructure/forms.repository'

async function getService() {
  const client = await getServerSupabaseClient()
  return new FormsService(new SupabaseFormsRepository(client), client, recordAuditLog)
}

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid form id')
  const body = await req.json()
  const parsed = formUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid form payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const form = await service.updateForm(actor, idResult.data, parsed.data, requestId)
  return ok(form, requestId)
})

export const DELETE = withParamsRoute<{ id: string }>(async (_req, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid form id')
  const actor = await resolveActor()
  const service = await getService()
  await service.deleteForm(actor, idResult.data, requestId)
  return ok({ deleted: true }, requestId)
})
