import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { uuidSchema } from '@/shared/validation/common'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { formCreateSchema } from '@/modules/forms/schemas/forms.schema'
import { FormsService } from '@/modules/forms/application/forms.service'
import { SupabaseFormsRepository } from '@/modules/forms/infrastructure/forms.repository'

const listQuerySchema = z.object({ websiteId: uuidSchema })

async function getService() {
  const client = await getServerSupabaseClient()
  return new FormsService(new SupabaseFormsRepository(client), client, recordAuditLog)
}

export const GET = withRoute(async (req: NextRequest, requestId) => {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
  await resolveActor()
  const service = await getService()
  const forms = await service.listForms(parsed.data.websiteId)
  return ok(forms, requestId)
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = formCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid form payload', { issues: parsed.error.issues })
  const actor = await resolveActor()
  const service = await getService()
  const form = await service.createForm(actor, parsed.data, requestId)
  return ok(form, requestId)
})
