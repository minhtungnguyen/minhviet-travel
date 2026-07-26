import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { SettingDefinition, SettingValue, SettingsScopeLevel } from '@/modules/settings/domain/types'

export interface SettingsRepository {
  listDefinitions(): Promise<SettingDefinition[]>
  findDefinitionByKey(key: string): Promise<SettingDefinition | null>
  listValuesForDefinition(definitionId: string): Promise<SettingValue[]>
  findValue(definitionId: string, scopeLevel: SettingsScopeLevel, scopeResourceId: string | null): Promise<SettingValue | null>
  upsertValue(
    definitionId: string,
    scopeLevel: SettingsScopeLevel,
    scopeResourceId: string | null,
    value: unknown,
    actorId: string,
  ): Promise<SettingValue>
  deleteValue(definitionId: string, scopeLevel: SettingsScopeLevel, scopeResourceId: string | null): Promise<void>
}

type DefinitionRow = {
  id: string
  key: string
  namespace: string
  value_type: string
  default_value: unknown
  description: string
  is_secret: boolean
  visibility: string
}

function mapDefinition(row: DefinitionRow): SettingDefinition {
  return {
    id: row.id,
    key: row.key,
    namespace: row.namespace,
    valueType: row.value_type as SettingDefinition['valueType'],
    defaultValue: row.default_value,
    description: row.description,
    isSecret: row.is_secret,
    visibility: row.visibility as SettingDefinition['visibility'],
  }
}

type ValueRow = {
  id: string
  setting_definition_id: string
  scope_level: string
  scope_resource_id: string | null
  value: unknown
}

function mapValue(row: ValueRow): SettingValue {
  return {
    id: row.id,
    settingDefinitionId: row.setting_definition_id,
    scopeLevel: row.scope_level as SettingsScopeLevel,
    scopeResourceId: row.scope_resource_id,
    value: row.value,
  }
}

export class SupabaseSettingsRepository implements SettingsRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listDefinitions(): Promise<SettingDefinition[]> {
    const { data, error } = await this.client.from('setting_definitions').select('*').order('namespace')
    if (error) throw mapDatabaseError(error, 'SettingDefinition')
    return (data ?? []).map(mapDefinition)
  }

  async findDefinitionByKey(key: string): Promise<SettingDefinition | null> {
    const { data, error } = await this.client.from('setting_definitions').select('*').eq('key', key).maybeSingle()
    if (error) throw mapDatabaseError(error, 'SettingDefinition')
    return data ? mapDefinition(data) : null
  }

  async listValuesForDefinition(definitionId: string): Promise<SettingValue[]> {
    const { data, error } = await this.client
      .from('setting_values')
      .select('*')
      .eq('setting_definition_id', definitionId)
    if (error) throw mapDatabaseError(error, 'SettingValue')
    return (data ?? []).map(mapValue)
  }

  async findValue(
    definitionId: string,
    scopeLevel: SettingsScopeLevel,
    scopeResourceId: string | null,
  ): Promise<SettingValue | null> {
    let builder = this.client
      .from('setting_values')
      .select('*')
      .eq('setting_definition_id', definitionId)
      .eq('scope_level', scopeLevel)
    builder = scopeResourceId === null ? builder.is('scope_resource_id', null) : builder.eq('scope_resource_id', scopeResourceId)
    const { data, error } = await builder.maybeSingle()
    if (error) throw mapDatabaseError(error, 'SettingValue')
    return data ? mapValue(data) : null
  }

  async upsertValue(
    definitionId: string,
    scopeLevel: SettingsScopeLevel,
    scopeResourceId: string | null,
    value: unknown,
    actorId: string,
  ): Promise<SettingValue> {
    const { data, error } = await this.client
      .from('setting_values')
      .upsert(
        {
          setting_definition_id: definitionId,
          scope_level: scopeLevel,
          scope_resource_id: scopeResourceId,
          value: value as never,
          created_by: actorId,
          updated_by: actorId,
        },
        { onConflict: 'setting_definition_id,scope_level,scope_resource_id' },
      )
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'SettingValue')
    return mapValue(data)
  }

  async deleteValue(definitionId: string, scopeLevel: SettingsScopeLevel, scopeResourceId: string | null): Promise<void> {
    let builder = this.client
      .from('setting_values')
      .delete()
      .eq('setting_definition_id', definitionId)
      .eq('scope_level', scopeLevel)
    builder = scopeResourceId === null ? builder.is('scope_resource_id', null) : builder.eq('scope_resource_id', scopeResourceId)
    const { error } = await builder
    if (error) throw mapDatabaseError(error, 'SettingValue')
  }
}
