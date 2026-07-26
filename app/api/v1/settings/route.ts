import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'

/** Lists the setting catalog (definitions), not resolved values — see GET /settings/resolved for that. */
export const GET = withRoute(async (_req: NextRequest, requestId) => {
  await resolveActor()
  const service = new SettingsService(new SupabaseSettingsRepository(await getServerSupabaseClient()), recordAuditLog)
  const definitions = await service.listDefinitions()
  return ok(definitions, requestId)
})
