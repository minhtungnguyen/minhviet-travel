import type { NextRequest } from 'next/server'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { settingValueDeleteQuerySchema, settingValuePutSchema } from '@/modules/settings/schemas/settings.schema'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'

/**
 * `setting_definitions.key` is already the full dotted key (e.g.
 * 'company.hotline'); `namespace` is stored as a separate column but is
 * always its prefix — this route reconstructs it from the two URL
 * segments rather than requiring the client to know the encoding.
 */
function toFullKey(namespace: string, key: string) {
  return `${namespace}.${key}`
}

async function getService() {
  return new SettingsService(new SupabaseSettingsRepository(await getServerSupabaseClient()), recordAuditLog)
}

export const GET = withParamsRoute<{ namespace: string; key: string }>(
  async (_req, { namespace, key }, requestId) => {
    await resolveActor()
    const service = await getService()
    const result = await service.getSetting(toFullKey(namespace, key), {})
    return ok(result, requestId)
  },
)

export const PUT = withParamsRoute<{ namespace: string; key: string }>(
  async (req: NextRequest, { namespace, key }, requestId) => {
    const body = await req.json()
    const parsed = settingValuePutSchema.safeParse(body)
    if (!parsed.success) throw AppError.validation('Invalid setting value payload', { issues: parsed.error.issues })
    const actor = await resolveActor()
    const service = await getService()
    const setting = await service.putSettingValue(
      actor,
      toFullKey(namespace, key),
      parsed.data.scopeLevel,
      parsed.data.scopeResourceId,
      parsed.data.value,
      requestId,
    )
    return ok(setting, requestId)
  },
)

export const DELETE = withParamsRoute<{ namespace: string; key: string }>(
  async (req: NextRequest, { namespace, key }, requestId) => {
    const parsed = settingValueDeleteQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
    if (!parsed.success) throw AppError.validation('Invalid query parameters', { issues: parsed.error.issues })
    const actor = await resolveActor()
    const service = await getService()
    await service.deleteSettingValue(
      actor,
      toFullKey(namespace, key),
      parsed.data.scopeLevel,
      parsed.data.scopeResourceId ?? null,
      requestId,
    )
    return ok({ deleted: true }, requestId)
  },
)
