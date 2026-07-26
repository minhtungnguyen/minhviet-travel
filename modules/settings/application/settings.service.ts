import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import type {
  ResolvedSetting,
  SettingDefinition,
  SettingsResolutionContext,
  SettingsScopeLevel,
} from '@/modules/settings/domain/types'

/** Priority order for resolution — first match wins. Matches the exact order documented in 0006_settings.sql. */
const RESOLUTION_ORDER: { level: SettingsScopeLevel; resourceKey: keyof SettingsResolutionContext | null }[] = [
  { level: 'USER', resourceKey: 'userId' },
  { level: 'WEBSITE', resourceKey: 'websiteId' },
  { level: 'BRAND', resourceKey: 'brandId' },
  { level: 'ORGANIZATION', resourceKey: 'organizationId' },
  { level: 'GLOBAL', resourceKey: null },
]

function validateValueShape(definition: SettingDefinition, value: unknown): void {
  switch (definition.valueType) {
    case 'STRING':
      if (typeof value !== 'string') throw AppError.validation(`Setting "${definition.key}" requires a string value`)
      return
    case 'NUMBER':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw AppError.validation(`Setting "${definition.key}" requires a number value`)
      }
      return
    case 'BOOLEAN':
      if (typeof value !== 'boolean') throw AppError.validation(`Setting "${definition.key}" requires a boolean value`)
      return
    case 'JSON':
      // Any JSON-serializable value is acceptable — the definition's own
      // description documents its expected shape; a generic JSON column
      // can't be schema-validated further without a per-key registry
      // (deliberately not built — master-prompt §36 principle 19).
      return
  }
}

export class SettingsService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async listDefinitions() {
    return this.repository.listDefinitions()
  }

  /**
   * Resolves every definition against the given context in one pass:
   * USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > definition default.
   */
  async resolveAll(context: SettingsResolutionContext): Promise<ResolvedSetting[]> {
    const definitions = await this.repository.listDefinitions()
    const resolved: ResolvedSetting[] = []
    for (const definition of definitions) {
      resolved.push(await this.resolveOne(definition, context))
    }
    return resolved
  }

  private async resolveOne(definition: SettingDefinition, context: SettingsResolutionContext): Promise<ResolvedSetting> {
    for (const { level, resourceKey } of RESOLUTION_ORDER) {
      const resourceId = resourceKey ? (context[resourceKey] ?? null) : null
      if (resourceKey && !resourceId) continue // no id in context for this scope — skip, don't check GLOBAL's null-id case by accident
      const found = await this.repository.findValue(definition.id, level, resourceId)
      if (found) {
        return {
          key: definition.key,
          namespace: definition.namespace,
          valueType: definition.valueType,
          visibility: definition.visibility,
          value: found.value,
          resolvedFrom: level,
        }
      }
    }
    return {
      key: definition.key,
      namespace: definition.namespace,
      valueType: definition.valueType,
      visibility: definition.visibility,
      value: definition.defaultValue,
      resolvedFrom: 'DEFAULT',
    }
  }

  async getSetting(key: string, context: SettingsResolutionContext) {
    const definition = await this.repository.findDefinitionByKey(key)
    if (!definition) throw AppError.notFound('SettingDefinition', key)
    const resolved = await this.resolveOne(definition, context)
    const overrides = await this.repository.listValuesForDefinition(definition.id)
    return { definition, resolved, overrides }
  }

  async putSettingValue(
    actor: ActorContext,
    key: string,
    scopeLevel: SettingsScopeLevel,
    scopeResourceId: string | null,
    value: unknown,
    requestId: string,
  ) {
    requirePermission(actor, 'settings.website.update')
    const definition = await this.repository.findDefinitionByKey(key)
    if (!definition) throw AppError.notFound('SettingDefinition', key)

    // Defense-in-depth alongside the DB's own WITH CHECK
    // (staff_write_setting_values in 0003_internal_tables_policies.sql),
    // which blocks this at the RLS layer regardless — this just gives a
    // clearer error message before that round-trip.
    if (definition.isSecret) {
      throw AppError.forbidden(`Setting "${key}" is secret and cannot be written through this endpoint`)
    }
    validateValueShape(definition, value)

    const setting = await this.repository.upsertValue(definition.id, scopeLevel, scopeResourceId, value, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'setting.updated',
      entityType: 'setting_value',
      entityId: setting.id,
      requestId,
      reason: `key=${key} scope=${scopeLevel}`,
    })
    return setting
  }

  async deleteSettingValue(
    actor: ActorContext,
    key: string,
    scopeLevel: SettingsScopeLevel,
    scopeResourceId: string | null,
    requestId: string,
  ) {
    requirePermission(actor, 'settings.website.update')
    const definition = await this.repository.findDefinitionByKey(key)
    if (!definition) throw AppError.notFound('SettingDefinition', key)
    await this.repository.deleteValue(definition.id, scopeLevel, scopeResourceId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'setting.override_removed',
      entityType: 'setting_value',
      requestId,
      reason: `key=${key} scope=${scopeLevel}`,
    })
  }
}
