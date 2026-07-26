import { describe, expect, it } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import type { OrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'
import type { Brand, Organization } from '@/modules/organization/domain/types'

const ORG_A: Organization = {
  id: 'org-a',
  legalName: 'Org A Ltd',
  displayName: 'Org A',
  taxCode: null,
  businessRegistrationNumber: null,
  countryCode: 'VN',
  defaultCurrencyCode: 'VND',
  defaultLanguageCode: 'vi',
  defaultTimezone: 'Asia/Ho_Chi_Minh',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const BRAND_A: Brand = {
  id: 'brand-a',
  organizationId: 'org-a',
  name: 'Brand A',
  slug: 'brand-a',
  displayName: 'Brand A',
  description: null,
  logoMediaId: null,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const noopAuditLogger = async () => {}

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-a',
    roles: ['VIEWER'],
    permissions: new Set(),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

function makeFakeRepository(overrides: Partial<OrganizationRepository> = {}): OrganizationRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  return {
    findOrganizationById: async (id) => (id === ORG_A.id ? ORG_A : null),
    listOrganizations: notUsed,
    createOrganization: notUsed,
    updateOrganization: notUsed,
    findBrandById: async (id) => (id === BRAND_A.id ? BRAND_A : null),
    findBrandBySlug: async () => null,
    listBrandsByOrganization: notUsed,
    createBrand: notUsed,
    updateBrand: notUsed,
    archiveBrand: notUsed,
    findWebsiteById: notUsed,
    findWebsiteByDomain: async () => null,
    listWebsitesByBrand: notUsed,
    createWebsite: notUsed,
    updateWebsite: notUsed,
    softDeleteWebsite: notUsed,
    findBusinessUnitById: notUsed,
    listBusinessUnitsByOrganization: notUsed,
    createBusinessUnit: notUsed,
    updateBusinessUnit: notUsed,
    archiveBusinessUnit: notUsed,
    findOfficeById: notUsed,
    listOfficesByOrganization: notUsed,
    createOffice: notUsed,
    updateOffice: notUsed,
    archiveOffice: notUsed,
    findDepartmentById: notUsed,
    listDepartmentsByOrganization: notUsed,
    createDepartment: notUsed,
    updateDepartment: notUsed,
    archiveDepartment: notUsed,
    findPositionById: notUsed,
    listPositionsByDepartment: notUsed,
    createPosition: notUsed,
    updatePosition: notUsed,
    archivePosition: notUsed,
    ...overrides,
  }
}

describe('OrganizationService — organization isolation', () => {
  it('a member of the organization can read it without an elevated permission', async () => {
    const service = new OrganizationService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor({ organizationId: 'org-a' })
    await expect(service.getOrganization(actor, 'org-a')).resolves.toEqual(ORG_A)
  })

  it('a user from a different organization is denied without settings.organization.update', async () => {
    const service = new OrganizationService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor({ organizationId: 'org-b', permissions: new Set() })
    await expect(service.getOrganization(actor, 'org-a')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('a user from a different organization CAN read it if they hold settings.organization.update', async () => {
    const service = new OrganizationService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor({ organizationId: 'org-b', permissions: new Set(['settings.organization.update']) })
    await expect(service.getOrganization(actor, 'org-a')).resolves.toEqual(ORG_A)
  })

  it('the same isolation rule applies to brands (via their owning organization)', async () => {
    const service = new OrganizationService(makeFakeRepository(), noopAuditLogger)
    const outsider = makeActor({ organizationId: 'org-b', permissions: new Set() })
    await expect(service.getBrand(outsider, 'brand-a')).rejects.toMatchObject({ code: 'FORBIDDEN' })

    const member = makeActor({ organizationId: 'org-a' })
    await expect(service.getBrand(member, 'brand-a')).resolves.toEqual(BRAND_A)
  })

  it('throws NOT_FOUND (not a permission error) for a genuinely nonexistent organization', async () => {
    const service = new OrganizationService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor({ permissions: new Set(['settings.organization.update']) })
    await expect(service.getOrganization(actor, 'org-does-not-exist')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
