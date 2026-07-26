import { describe, expect, it } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import { SettingsService } from '@/modules/settings/application/settings.service'
import type { SettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import type { SettingDefinition, SettingValue, SettingsScopeLevel } from '@/modules/settings/domain/types'

const DEFINITION: SettingDefinition = {
  id: 'def-1',
  key: 'company.hotline',
  namespace: 'company',
  valueType: 'STRING',
  defaultValue: 'default-hotline',
  description: 'Primary hotline',
  isSecret: false,
  visibility: 'PUBLIC',
}

const SECRET_DEFINITION: SettingDefinition = {
  ...DEFINITION,
  id: 'def-secret',
  key: 'integration.api_key',
  isSecret: true,
}

const noopAuditLogger = async () => {}

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['SUPER_ADMIN'],
    permissions: new Set(['settings.website.update']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

/** Values keyed by "scopeLevel:scopeResourceId" — enough to prove resolution priority without a real DB. */
function makeFakeRepository(values: Map<string, SettingValue>, definitions: SettingDefinition[] = [DEFINITION]): SettingsRepository {
  return {
    listDefinitions: async () => definitions,
    findDefinitionByKey: async (key) => definitions.find((d) => d.key === key) ?? null,
    listValuesForDefinition: async (definitionId) =>
      Array.from(values.values()).filter((v) => v.settingDefinitionId === definitionId),
    findValue: async (definitionId, scopeLevel, scopeResourceId) =>
      values.get(`${definitionId}:${scopeLevel}:${scopeResourceId ?? 'null'}`) ?? null,
    upsertValue: async (definitionId, scopeLevel, scopeResourceId, value) => {
      const setting: SettingValue = { id: 'sv-new', settingDefinitionId: definitionId, scopeLevel, scopeResourceId, value }
      values.set(`${definitionId}:${scopeLevel}:${scopeResourceId ?? 'null'}`, setting)
      return setting
    },
    deleteValue: async () => {},
  }
}

function value(scopeLevel: SettingsScopeLevel, scopeResourceId: string | null, val: unknown): SettingValue {
  return { id: `sv-${scopeLevel}`, settingDefinitionId: DEFINITION.id, scopeLevel, scopeResourceId, value: val }
}

describe('SettingsService — resolution order (USER > WEBSITE > BRAND > ORGANIZATION > GLOBAL > default)', () => {
  it('falls back to the definition default when no override exists at any scope', async () => {
    const service = new SettingsService(makeFakeRepository(new Map()), noopAuditLogger)
    const [resolved] = await service.resolveAll({ userId: 'user-1', organizationId: 'org-1' })
    expect(resolved.value).toBe('default-hotline')
    expect(resolved.resolvedFrom).toBe('DEFAULT')
  })

  it('an ORGANIZATION-level override wins over the default', async () => {
    const values = new Map([
      [`${DEFINITION.id}:ORGANIZATION:org-1`, value('ORGANIZATION', 'org-1', 'org-hotline')],
    ])
    const service = new SettingsService(makeFakeRepository(values), noopAuditLogger)
    const [resolved] = await service.resolveAll({ userId: 'user-1', organizationId: 'org-1' })
    expect(resolved.value).toBe('org-hotline')
    expect(resolved.resolvedFrom).toBe('ORGANIZATION')
  })

  it('a WEBSITE-level override wins over an ORGANIZATION-level override', async () => {
    const values = new Map([
      [`${DEFINITION.id}:ORGANIZATION:org-1`, value('ORGANIZATION', 'org-1', 'org-hotline')],
      [`${DEFINITION.id}:WEBSITE:site-1`, value('WEBSITE', 'site-1', 'website-hotline')],
    ])
    const service = new SettingsService(makeFakeRepository(values), noopAuditLogger)
    const [resolved] = await service.resolveAll({ userId: 'user-1', organizationId: 'org-1', websiteId: 'site-1' })
    expect(resolved.value).toBe('website-hotline')
    expect(resolved.resolvedFrom).toBe('WEBSITE')
  })

  it('a USER-level override wins over everything else, including WEBSITE', async () => {
    const values = new Map([
      [`${DEFINITION.id}:ORGANIZATION:org-1`, value('ORGANIZATION', 'org-1', 'org-hotline')],
      [`${DEFINITION.id}:WEBSITE:site-1`, value('WEBSITE', 'site-1', 'website-hotline')],
      [`${DEFINITION.id}:USER:user-1`, value('USER', 'user-1', 'my-personal-hotline')],
    ])
    const service = new SettingsService(makeFakeRepository(values), noopAuditLogger)
    const [resolved] = await service.resolveAll({ userId: 'user-1', organizationId: 'org-1', websiteId: 'site-1' })
    expect(resolved.value).toBe('my-personal-hotline')
    expect(resolved.resolvedFrom).toBe('USER')
  })

  it('a GLOBAL override applies when no more specific scope has one', async () => {
    const values = new Map([[`${DEFINITION.id}:GLOBAL:null`, value('GLOBAL', null, 'global-hotline')]])
    const service = new SettingsService(makeFakeRepository(values), noopAuditLogger)
    const [resolved] = await service.resolveAll({ userId: 'user-1', organizationId: 'org-1' })
    expect(resolved.value).toBe('global-hotline')
    expect(resolved.resolvedFrom).toBe('GLOBAL')
  })
})

describe('SettingsService — write guards', () => {
  it('rejects writing a value for an is_secret definition, even with the right permission', async () => {
    const repository = makeFakeRepository(new Map(), [SECRET_DEFINITION])
    const service = new SettingsService(repository, noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.putSettingValue(actor, SECRET_DEFINITION.key, 'GLOBAL', null, 'leaked-value', 'req-1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('rejects a value that does not match the definition value_type', async () => {
    const service = new SettingsService(makeFakeRepository(new Map()), noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.putSettingValue(actor, DEFINITION.key, 'GLOBAL', null, 12345, 'req-1'), // STRING type, number given
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('accepts a correctly-typed value and persists it', async () => {
    const values = new Map<string, SettingValue>()
    const service = new SettingsService(makeFakeRepository(values), noopAuditLogger)
    const actor = makeActor()
    const result = await service.putSettingValue(actor, DEFINITION.key, 'WEBSITE', 'site-1', 'new-hotline', 'req-1')
    expect(result.value).toBe('new-hotline')
  })

  it('rejects writes without settings.website.update', async () => {
    const service = new SettingsService(makeFakeRepository(new Map()), noopAuditLogger)
    const actor = makeActor({ permissions: new Set() })
    await expect(
      service.putSettingValue(actor, DEFINITION.key, 'GLOBAL', null, 'x', 'req-1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
