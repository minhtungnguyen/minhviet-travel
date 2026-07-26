import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { formSubmissionAdminUpdateSchema } from '@/modules/forms/schemas/forms.schema'
import { FormsService } from '@/modules/forms/application/forms.service'
import { SupabaseFormsRepository } from '@/modules/forms/infrastructure/forms.repository'

export const PATCH = withParamsRoute<{ id: string }>(async (req: NextRequest, { id }, requestId) => {
  const idResult = uuidSchema.safeParse(id)
  if (!idResult.success) throw AppError.validation('Invalid form submission id')
  const body = await req.json()
  const parsed = formSubmissionAdminUpdateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid form submission payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const client = await getServerSupabaseClient()
  const service = new FormsService(new SupabaseFormsRepository(client), client, recordAuditLog)
  const submission = await service.updateSubmissionStatus(actor, idResult.data, parsed.data.status, requestId)
  return ok(submission, requestId)
})
