import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { OrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'
import type {
  BrandCreateInput,
  BrandUpdateInput,
  BusinessUnitCreateInput,
  BusinessUnitUpdateInput,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  OfficeCreateInput,
  OfficeUpdateInput,
  OrganizationCreateInput,
  OrganizationUpdateInput,
  PositionCreateInput,
  PositionUpdateInput,
  WebsiteCreateInput,
  WebsiteUpdateInput,
} from '@/modules/organization/schemas/organization.schema'

/**
 * Business logic lives here, not in the route handler (master-prompt
 * §14). Every mutating method calls `requirePermission` first — this is
 * the service-layer authorization check that backs up (never
 * substitutes for) the RLS policies in database/policies/ — then writes
 * an audit record after the mutation succeeds (spec §8/§18: "Audit all
 * structural changes").
 *
 * Organizations, brands, business units, offices, departments and
 * positions are all queried and mutated generically (no hardcoded
 * single-organization id anywhere) so a future multi-organization/
 * multi-brand hierarchy is additive here, not a rewrite — the schema
 * itself has no `parent_organization_id` yet (V1 is explicitly
 * single-organization per Volume 00), so that specific column is a
 * documented future migration, not something this service fakes.
 */
export class OrganizationService {
  constructor(
    private readonly repository: OrganizationRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async getOrganization(actor: ActorContext, id: string) {
    const organization = await this.repository.findOrganizationById(id)
    if (!organization) throw AppError.notFound('Organization', id)
    if (organization.id !== actor.organizationId) {
      requirePermission(actor, 'settings.organization.update')
    }
    return organization
  }

  async listOrganizations(actor: ActorContext, query: PaginationQuery) {
    requirePermission(actor, 'settings.organization.update')
    return this.repository.listOrganizations(query)
  }

  async createOrganization(actor: ActorContext, input: OrganizationCreateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const organization = await this.repository.createOrganization(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: organization.id,
      action: 'organization.created',
      entityType: 'organization',
      entityId: organization.id,
      requestId,
    })
    return organization
  }

  async updateOrganization(actor: ActorContext, id: string, input: OrganizationUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findOrganizationById(id)
    if (!existing) throw AppError.notFound('Organization', id)
    const organization = await this.repository.updateOrganization(id, input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: id,
      action: 'organization.updated',
      entityType: 'organization',
      entityId: id,
      requestId,
    })
    return organization
  }

  async getBrand(actor: ActorContext, id: string) {
    const brand = await this.repository.findBrandById(id)
    if (!brand) throw AppError.notFound('Brand', id)
    if (brand.organizationId !== actor.organizationId) {
      requirePermission(actor, 'settings.brand.update')
    }
    return brand
  }

  async listBrands(actor: ActorContext, organizationId: string, query: PaginationQuery) {
    if (organizationId !== actor.organizationId) {
      requirePermission(actor, 'settings.organization.update')
    }
    return this.repository.listBrandsByOrganization(organizationId, query)
  }

  async createBrand(actor: ActorContext, input: BrandCreateInput, requestId: string) {
    requirePermission(actor, 'settings.brand.update')
    const existing = await this.repository.findBrandBySlug(input.slug)
    if (existing) throw AppError.conflict(`Brand slug "${input.slug}" is already registered`)
    const brand = await this.repository.createBrand(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: brand.organizationId,
      action: 'brand.created',
      entityType: 'brand',
      entityId: brand.id,
      requestId,
    })
    return brand
  }

  async updateBrand(actor: ActorContext, id: string, input: BrandUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.brand.update')
    const existing = await this.repository.findBrandById(id)
    if (!existing) throw AppError.notFound('Brand', id)
    if (input.slug && input.slug !== existing.slug) {
      const conflict = await this.repository.findBrandBySlug(input.slug)
      if (conflict) throw AppError.conflict(`Brand slug "${input.slug}" is already registered`)
    }
    const brand = await this.repository.updateBrand(id, input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'brand.updated',
      entityType: 'brand',
      entityId: id,
      requestId,
    })
    return brand
  }

  async archiveBrand(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.brand.update')
    const existing = await this.repository.findBrandById(id)
    if (!existing) throw AppError.notFound('Brand', id)
    const brand = await this.repository.archiveBrand(id, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'brand.archived',
      entityType: 'brand',
      entityId: id,
      requestId,
    })
    return brand
  }

  async getWebsite(actor: ActorContext, id: string) {
    const website = await this.repository.findWebsiteById(id)
    if (!website) throw AppError.notFound('Website', id)
    return website
  }

  async listWebsites(actor: ActorContext, brandId: string, query: PaginationQuery) {
    requirePermission(actor, 'settings.website.read')
    return this.repository.listWebsitesByBrand(brandId, query)
  }

  async createWebsite(actor: ActorContext, input: WebsiteCreateInput, requestId: string) {
    requirePermission(actor, 'settings.website.update')
    const existing = await this.repository.findWebsiteByDomain(input.domain)
    if (existing) throw AppError.conflict(`Domain ${input.domain} is already registered`)
    const website = await this.repository.createWebsite(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: website.id,
      action: 'website.created',
      entityType: 'website',
      entityId: website.id,
      requestId,
    })
    return website
  }

  async updateWebsite(actor: ActorContext, id: string, input: WebsiteUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.website.update')
    const existing = await this.repository.findWebsiteById(id)
    if (!existing) throw AppError.notFound('Website', id)
    const website = await this.repository.updateWebsite(id, input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: id,
      action: 'website.updated',
      entityType: 'website',
      entityId: id,
      requestId,
    })
    return website
  }

  async deleteWebsite(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.website.update')
    const existing = await this.repository.findWebsiteById(id)
    if (!existing) throw AppError.notFound('Website', id)
    // websites.brand_id has no ON DELETE — a soft-deleted website is
    // simply excluded from every find*/list* query going forward
    // (database/migrations/0004_organization.sql's active-only partial
    // unique index on domain relies on exactly this).
    await this.repository.softDeleteWebsite(id, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: id,
      action: 'website.deleted',
      entityType: 'website',
      entityId: id,
      requestId,
    })
  }

  async listBusinessUnits(actor: ActorContext, organizationId: string) {
    if (organizationId !== actor.organizationId) {
      requirePermission(actor, 'settings.organization.update')
    }
    return this.repository.listBusinessUnitsByOrganization(organizationId)
  }

  async createBusinessUnit(actor: ActorContext, input: BusinessUnitCreateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const businessUnit = await this.repository.createBusinessUnit(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: input.organizationId,
      action: 'business_unit.created',
      entityType: 'business_unit',
      entityId: businessUnit.id,
      requestId,
    })
    return businessUnit
  }

  async updateBusinessUnit(actor: ActorContext, id: string, input: BusinessUnitUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findBusinessUnitById(id)
    if (!existing) throw AppError.notFound('BusinessUnit', id)
    const businessUnit = await this.repository.updateBusinessUnit(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'business_unit.updated',
      entityType: 'business_unit',
      entityId: id,
      requestId,
    })
    return businessUnit
  }

  async archiveBusinessUnit(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findBusinessUnitById(id)
    if (!existing) throw AppError.notFound('BusinessUnit', id)
    const businessUnit = await this.repository.archiveBusinessUnit(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'business_unit.archived',
      entityType: 'business_unit',
      entityId: id,
      requestId,
    })
    return businessUnit
  }

  async listOffices(actor: ActorContext, organizationId: string) {
    if (organizationId !== actor.organizationId) {
      requirePermission(actor, 'settings.organization.update')
    }
    return this.repository.listOfficesByOrganization(organizationId)
  }

  async createOffice(actor: ActorContext, input: OfficeCreateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const office = await this.repository.createOffice(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: input.organizationId,
      action: 'office.created',
      entityType: 'office',
      entityId: office.id,
      requestId,
    })
    return office
  }

  async updateOffice(actor: ActorContext, id: string, input: OfficeUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findOfficeById(id)
    if (!existing) throw AppError.notFound('Office', id)
    const office = await this.repository.updateOffice(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'office.updated',
      entityType: 'office',
      entityId: id,
      requestId,
    })
    return office
  }

  async archiveOffice(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findOfficeById(id)
    if (!existing) throw AppError.notFound('Office', id)
    const office = await this.repository.archiveOffice(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'office.archived',
      entityType: 'office',
      entityId: id,
      requestId,
    })
    return office
  }

  async listDepartments(actor: ActorContext, organizationId: string) {
    if (organizationId !== actor.organizationId) {
      requirePermission(actor, 'settings.organization.update')
    }
    return this.repository.listDepartmentsByOrganization(organizationId)
  }

  async createDepartment(actor: ActorContext, input: DepartmentCreateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const department = await this.repository.createDepartment(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: input.organizationId,
      action: 'department.created',
      entityType: 'department',
      entityId: department.id,
      requestId,
    })
    return department
  }

  async updateDepartment(actor: ActorContext, id: string, input: DepartmentUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findDepartmentById(id)
    if (!existing) throw AppError.notFound('Department', id)
    const department = await this.repository.updateDepartment(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'department.updated',
      entityType: 'department',
      entityId: id,
      requestId,
    })
    return department
  }

  async archiveDepartment(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findDepartmentById(id)
    if (!existing) throw AppError.notFound('Department', id)
    const department = await this.repository.archiveDepartment(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      action: 'department.archived',
      entityType: 'department',
      entityId: id,
      requestId,
    })
    return department
  }

  async listPositions(actor: ActorContext, departmentId: string) {
    requirePermission(actor, 'settings.organization.update')
    return this.repository.listPositionsByDepartment(departmentId)
  }

  async createPosition(actor: ActorContext, input: PositionCreateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const position = await this.repository.createPosition(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'position.created',
      entityType: 'position',
      entityId: position.id,
      requestId,
    })
    return position
  }

  async updatePosition(actor: ActorContext, id: string, input: PositionUpdateInput, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findPositionById(id)
    if (!existing) throw AppError.notFound('Position', id)
    const position = await this.repository.updatePosition(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'position.updated',
      entityType: 'position',
      entityId: id,
      requestId,
    })
    return position
  }

  async archivePosition(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'settings.organization.update')
    const existing = await this.repository.findPositionById(id)
    if (!existing) throw AppError.notFound('Position', id)
    const position = await this.repository.archivePosition(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'position.archived',
      entityType: 'position',
      entityId: id,
      requestId,
    })
    return position
  }
}
