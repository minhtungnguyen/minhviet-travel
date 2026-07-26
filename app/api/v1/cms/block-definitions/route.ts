import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

/** Read-only — the block-definition catalog is seeded; writes are deferred until an admin UI needs them (Sprint 1B.2 plan). */
export const GET = withRoute(async (_req: NextRequest, requestId) => {
  await resolveActor()
  const client = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const definitions = await service.listBlockDefinitions()
  return ok(definitions, requestId)
})
