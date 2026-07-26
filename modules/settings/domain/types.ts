/**
 * Domain types for database/migrations/0006_settings.sql. Resolution
 * order at read time (documented in that migration's own header, not in
 * SQL): USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > definition default.
 */

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
export type SettingVisibility = 'PUBLIC' | 'INTERNAL'
export type SettingsScopeLevel = 'GLOBAL' | 'ORGANIZATION' | 'BRAND' | 'WEBSITE' | 'USER'

export type SettingDefinition = {
  id: string
  key: string
  namespace: string
  valueType: SettingValueType
  defaultValue: unknown
  description: string
  isSecret: boolean
  visibility: SettingVisibility
}

export type SettingValue = {
  id: string
  settingDefinitionId: string
  scopeLevel: SettingsScopeLevel
  scopeResourceId: string | null
  value: unknown
}

export type ResolvedSetting = {
  key: string
  namespace: string
  valueType: SettingValueType
  visibility: SettingVisibility
  value: unknown
  /** Which scope actually supplied the value, or 'DEFAULT' if no override exists at any scope. */
  resolvedFrom: SettingsScopeLevel | 'DEFAULT'
}

/** The actor-specific resource ids settings resolution checks, in priority order. */
export type SettingsResolutionContext = {
  userId?: string
  websiteId?: string
  brandId?: string
  organizationId?: string
}
