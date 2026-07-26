import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type {
  BusinessUnit,
  Brand,
  Department,
  Office,
  Organization,
  Position,
  Website,
} from '@/modules/organization/domain/types'
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
 * Repository interface the service layer depends on. The service never
 * imports a Supabase client directly (master-prompt §14: "Route Handler
 * -> Validation -> Authorization -> Application Service -> Repository ->
 * Database").
 *
 * Business units, offices, departments and positions take no `actorId`
 * parameter — none of those four tables has a `created_by`/`updated_by`
 * column (database/migrations/0004_organization.sql); the service layer
 * still receives the actor for permission checks and audit logging, it
 * just isn't persisted on these particular rows. "Delete" on every
 * organization-hierarchy table without a `deleted_at` column (all of
 * them except `websites`) is a status transition to `ARCHIVED`, not a
 * SQL `DELETE` — consistent with `entity_status` existing specifically
 * for this.
 */
export interface OrganizationRepository {
  findOrganizationById(id: string): Promise<Organization | null>
  listOrganizations(query: PaginationQuery): Promise<PaginatedResult<Organization>>
  createOrganization(input: OrganizationCreateInput, actorId: string): Promise<Organization>
  updateOrganization(id: string, input: OrganizationUpdateInput, actorId: string): Promise<Organization>

  findBrandById(id: string): Promise<Brand | null>
  findBrandBySlug(slug: string): Promise<Brand | null>
  listBrandsByOrganization(organizationId: string, query: PaginationQuery): Promise<PaginatedResult<Brand>>
  createBrand(input: BrandCreateInput, actorId: string): Promise<Brand>
  updateBrand(id: string, input: BrandUpdateInput, actorId: string): Promise<Brand>
  archiveBrand(id: string, actorId: string): Promise<Brand>

  findWebsiteById(id: string): Promise<Website | null>
  findWebsiteByDomain(domain: string): Promise<Website | null>
  listWebsitesByBrand(brandId: string, query: PaginationQuery): Promise<PaginatedResult<Website>>
  createWebsite(input: WebsiteCreateInput, actorId: string): Promise<Website>
  updateWebsite(id: string, input: WebsiteUpdateInput, actorId: string): Promise<Website>
  softDeleteWebsite(id: string, actorId: string): Promise<void>

  findBusinessUnitById(id: string): Promise<BusinessUnit | null>
  listBusinessUnitsByOrganization(organizationId: string): Promise<BusinessUnit[]>
  createBusinessUnit(input: BusinessUnitCreateInput): Promise<BusinessUnit>
  updateBusinessUnit(id: string, input: BusinessUnitUpdateInput): Promise<BusinessUnit>
  archiveBusinessUnit(id: string): Promise<BusinessUnit>

  findOfficeById(id: string): Promise<Office | null>
  listOfficesByOrganization(organizationId: string): Promise<Office[]>
  createOffice(input: OfficeCreateInput): Promise<Office>
  updateOffice(id: string, input: OfficeUpdateInput): Promise<Office>
  archiveOffice(id: string): Promise<Office>

  findDepartmentById(id: string): Promise<Department | null>
  listDepartmentsByOrganization(organizationId: string): Promise<Department[]>
  createDepartment(input: DepartmentCreateInput): Promise<Department>
  updateDepartment(id: string, input: DepartmentUpdateInput): Promise<Department>
  archiveDepartment(id: string): Promise<Department>

  findPositionById(id: string): Promise<Position | null>
  listPositionsByDepartment(departmentId: string): Promise<Position[]>
  createPosition(input: PositionCreateInput): Promise<Position>
  updatePosition(id: string, input: PositionUpdateInput): Promise<Position>
  archivePosition(id: string): Promise<Position>
}

type OrganizationRow = {
  id: string
  legal_name: string
  display_name: string
  tax_code: string | null
  business_registration_number: string | null
  country_code: string | null
  default_currency_code: string
  default_language_code: string
  default_timezone: string
  status: string
  created_at: string
  updated_at: string
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    legalName: row.legal_name,
    displayName: row.display_name,
    taxCode: row.tax_code,
    businessRegistrationNumber: row.business_registration_number,
    countryCode: row.country_code,
    defaultCurrencyCode: row.default_currency_code,
    defaultLanguageCode: row.default_language_code,
    defaultTimezone: row.default_timezone,
    status: row.status as Organization['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

type BrandRow = {
  id: string
  organization_id: string
  name: string
  slug: string
  display_name: string
  description: string | null
  logo_media_id: string | null
  status: string
  created_at: string
  updated_at: string
}

function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    logoMediaId: row.logo_media_id,
    status: row.status as Brand['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

type WebsiteRow = {
  id: string
  brand_id: string
  domain: string
  subdomain: string | null
  name: string
  website_type: string
  default_locale: string
  default_currency_code: string
  theme_key: string
  seo_defaults: unknown
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

function mapWebsite(row: WebsiteRow): Website {
  return {
    id: row.id,
    brandId: row.brand_id,
    domain: row.domain,
    subdomain: row.subdomain,
    name: row.name,
    websiteType: row.website_type as Website['websiteType'],
    defaultLocale: row.default_locale,
    defaultCurrencyCode: row.default_currency_code,
    themeKey: row.theme_key,
    seoDefaults: (row.seo_defaults ?? {}) as Record<string, unknown>,
    status: row.status as Website['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

type BusinessUnitRow = {
  id: string
  organization_id: string
  code: string
  name: string
  description: string | null
  status: string
}

function mapBusinessUnit(row: BusinessUnitRow): BusinessUnit {
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status as BusinessUnit['status'],
  }
}

type OfficeRow = {
  id: string
  organization_id: string
  name: string
  city: string | null
  country_code: string | null
  is_headquarters: boolean
  status: string
}

function mapOffice(row: OfficeRow): Office {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    city: row.city,
    countryCode: row.country_code,
    isHeadquarters: row.is_headquarters,
    status: row.status as Office['status'],
  }
}

type DepartmentRow = {
  id: string
  organization_id: string
  business_unit_id: string | null
  office_id: string | null
  parent_department_id: string | null
  name: string
  code: string
  status: string
}

function mapDepartment(row: DepartmentRow): Department {
  return {
    id: row.id,
    organizationId: row.organization_id,
    businessUnitId: row.business_unit_id,
    officeId: row.office_id,
    parentDepartmentId: row.parent_department_id,
    name: row.name,
    code: row.code,
    status: row.status as Department['status'],
  }
}

type PositionRow = {
  id: string
  department_id: string
  title: string
  level: number | null
  status: string
}

function mapPosition(row: PositionRow): Position {
  return {
    id: row.id,
    departmentId: row.department_id,
    title: row.title,
    level: row.level,
    status: row.status as Position['status'],
  }
}

function pageRange(query: PaginationQuery): [number, number] {
  const from = (query.page - 1) * query.pageSize
  return [from, from + query.pageSize - 1]
}

export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async findOrganizationById(id: string): Promise<Organization | null> {
    const { data, error } = await this.client.from('organizations').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Organization')
    return data ? mapOrganization(data) : null
  }

  async listOrganizations(query: PaginationQuery): Promise<PaginatedResult<Organization>> {
    let builder = this.client.from('organizations').select('*', { count: 'exact' })
    if (query.search) builder = builder.ilike('display_name', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(...pageRange(query))
    if (error) throw mapDatabaseError(error, 'Organization')
    return {
      items: (data ?? []).map(mapOrganization),
      page: query.page,
      pageSize: query.pageSize,
      total: count ?? 0,
    }
  }

  async createOrganization(input: OrganizationCreateInput, actorId: string): Promise<Organization> {
    const { data, error } = await this.client
      .from('organizations')
      .insert({
        legal_name: input.legalName,
        display_name: input.displayName,
        tax_code: input.taxCode ?? null,
        business_registration_number: input.businessRegistrationNumber ?? null,
        country_code: input.countryCode ?? null,
        default_currency_code: input.defaultCurrencyCode,
        default_language_code: input.defaultLanguageCode,
        default_timezone: input.defaultTimezone,
        created_by: actorId,
        updated_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Organization')
    return mapOrganization(data)
  }

  async updateOrganization(id: string, input: OrganizationUpdateInput, actorId: string): Promise<Organization> {
    const { data, error } = await this.client
      .from('organizations')
      .update({
        ...(input.legalName !== undefined && { legal_name: input.legalName }),
        ...(input.displayName !== undefined && { display_name: input.displayName }),
        ...(input.taxCode !== undefined && { tax_code: input.taxCode }),
        ...(input.businessRegistrationNumber !== undefined && {
          business_registration_number: input.businessRegistrationNumber,
        }),
        ...(input.countryCode !== undefined && { country_code: input.countryCode }),
        ...(input.defaultCurrencyCode !== undefined && { default_currency_code: input.defaultCurrencyCode }),
        ...(input.defaultLanguageCode !== undefined && { default_language_code: input.defaultLanguageCode }),
        ...(input.defaultTimezone !== undefined && { default_timezone: input.defaultTimezone }),
        ...(input.status !== undefined && { status: input.status }),
        updated_by: actorId,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Organization')
    return mapOrganization(data)
  }

  async findBrandById(id: string): Promise<Brand | null> {
    const { data, error } = await this.client.from('brands').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Brand')
    return data ? mapBrand(data) : null
  }

  async findBrandBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await this.client.from('brands').select('*').ilike('slug', slug).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Brand')
    return data ? mapBrand(data) : null
  }

  async listBrandsByOrganization(organizationId: string, query: PaginationQuery): Promise<PaginatedResult<Brand>> {
    let builder = this.client.from('brands').select('*', { count: 'exact' }).eq('organization_id', organizationId)
    if (query.search) builder = builder.ilike('display_name', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(...pageRange(query))
    if (error) throw mapDatabaseError(error, 'Brand')
    return { items: (data ?? []).map(mapBrand), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async createBrand(input: BrandCreateInput, actorId: string): Promise<Brand> {
    const { data, error } = await this.client
      .from('brands')
      .insert({
        organization_id: input.organizationId,
        name: input.name,
        slug: input.slug,
        display_name: input.displayName,
        description: input.description ?? null,
        logo_media_id: input.logoMediaId ?? null,
        created_by: actorId,
        updated_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Brand')
    return mapBrand(data)
  }

  async updateBrand(id: string, input: BrandUpdateInput, actorId: string): Promise<Brand> {
    const { data, error } = await this.client
      .from('brands')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.displayName !== undefined && { display_name: input.displayName }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.logoMediaId !== undefined && { logo_media_id: input.logoMediaId }),
        ...(input.status !== undefined && { status: input.status }),
        updated_by: actorId,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Brand')
    return mapBrand(data)
  }

  async archiveBrand(id: string, actorId: string): Promise<Brand> {
    const { data, error } = await this.client
      .from('brands')
      .update({ status: 'ARCHIVED', updated_by: actorId })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Brand')
    return mapBrand(data)
  }

  async findWebsiteById(id: string): Promise<Website | null> {
    const { data, error } = await this.client
      .from('websites')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'Website')
    return data ? mapWebsite(data) : null
  }

  async findWebsiteByDomain(domain: string): Promise<Website | null> {
    const { data, error } = await this.client
      .from('websites')
      .select('*')
      .ilike('domain', domain)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'Website')
    return data ? mapWebsite(data) : null
  }

  async listWebsitesByBrand(brandId: string, query: PaginationQuery): Promise<PaginatedResult<Website>> {
    let builder = this.client
      .from('websites')
      .select('*', { count: 'exact' })
      .eq('brand_id', brandId)
      .is('deleted_at', null)
    if (query.search) builder = builder.ilike('name', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(...pageRange(query))
    if (error) throw mapDatabaseError(error, 'Website')
    return { items: (data ?? []).map(mapWebsite), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async createWebsite(input: WebsiteCreateInput, actorId: string): Promise<Website> {
    const { data, error } = await this.client
      .from('websites')
      .insert({
        brand_id: input.brandId,
        domain: input.domain,
        subdomain: input.subdomain ?? null,
        name: input.name,
        website_type: input.websiteType,
        default_locale: input.defaultLocale,
        default_currency_code: input.defaultCurrencyCode,
        theme_key: input.themeKey,
        created_by: actorId,
        updated_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Website')
    return mapWebsite(data)
  }

  async updateWebsite(id: string, input: WebsiteUpdateInput, actorId: string): Promise<Website> {
    const { data, error } = await this.client
      .from('websites')
      .update({
        ...(input.subdomain !== undefined && { subdomain: input.subdomain }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.websiteType !== undefined && { website_type: input.websiteType }),
        ...(input.defaultLocale !== undefined && { default_locale: input.defaultLocale }),
        ...(input.defaultCurrencyCode !== undefined && { default_currency_code: input.defaultCurrencyCode }),
        ...(input.themeKey !== undefined && { theme_key: input.themeKey }),
        ...(input.status !== undefined && { status: input.status }),
        updated_by: actorId,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Website')
    return mapWebsite(data)
  }

  async softDeleteWebsite(id: string, actorId: string): Promise<void> {
    const { error } = await this.client
      .from('websites')
      .update({ deleted_at: new Date().toISOString(), updated_by: actorId })
      .eq('id', id)
    if (error) throw mapDatabaseError(error, 'Website')
  }

  async findBusinessUnitById(id: string): Promise<BusinessUnit | null> {
    const { data, error } = await this.client.from('business_units').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'BusinessUnit')
    return data ? mapBusinessUnit(data) : null
  }

  async listBusinessUnitsByOrganization(organizationId: string): Promise<BusinessUnit[]> {
    const { data, error } = await this.client
      .from('business_units')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    if (error) throw mapDatabaseError(error, 'BusinessUnit')
    return (data ?? []).map(mapBusinessUnit)
  }

  async createBusinessUnit(input: BusinessUnitCreateInput): Promise<BusinessUnit> {
    const { data, error } = await this.client
      .from('business_units')
      .insert({
        organization_id: input.organizationId,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'BusinessUnit')
    return mapBusinessUnit(data)
  }

  async updateBusinessUnit(id: string, input: BusinessUnitUpdateInput): Promise<BusinessUnit> {
    const { data, error } = await this.client
      .from('business_units')
      .update({
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'BusinessUnit')
    return mapBusinessUnit(data)
  }

  async archiveBusinessUnit(id: string): Promise<BusinessUnit> {
    const { data, error } = await this.client
      .from('business_units')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'BusinessUnit')
    return mapBusinessUnit(data)
  }

  async findOfficeById(id: string): Promise<Office | null> {
    const { data, error } = await this.client.from('offices').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Office')
    return data ? mapOffice(data) : null
  }

  async listOfficesByOrganization(organizationId: string): Promise<Office[]> {
    const { data, error } = await this.client
      .from('offices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    if (error) throw mapDatabaseError(error, 'Office')
    return (data ?? []).map(mapOffice)
  }

  async createOffice(input: OfficeCreateInput): Promise<Office> {
    const { data, error } = await this.client
      .from('offices')
      .insert({
        organization_id: input.organizationId,
        name: input.name,
        address_line1: input.addressLine1 ?? null,
        address_line2: input.addressLine2 ?? null,
        city: input.city ?? null,
        country_code: input.countryCode ?? null,
        phone: input.phone ?? null,
        is_headquarters: input.isHeadquarters,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Office')
    return mapOffice(data)
  }

  async updateOffice(id: string, input: OfficeUpdateInput): Promise<Office> {
    const { data, error } = await this.client
      .from('offices')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.addressLine1 !== undefined && { address_line1: input.addressLine1 }),
        ...(input.addressLine2 !== undefined && { address_line2: input.addressLine2 }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.countryCode !== undefined && { country_code: input.countryCode }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.isHeadquarters !== undefined && { is_headquarters: input.isHeadquarters }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Office')
    return mapOffice(data)
  }

  async archiveOffice(id: string): Promise<Office> {
    const { data, error } = await this.client
      .from('offices')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Office')
    return mapOffice(data)
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    const { data, error } = await this.client.from('departments').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Department')
    return data ? mapDepartment(data) : null
  }

  async listDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    const { data, error } = await this.client
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    if (error) throw mapDatabaseError(error, 'Department')
    return (data ?? []).map(mapDepartment)
  }

  async createDepartment(input: DepartmentCreateInput): Promise<Department> {
    const { data, error } = await this.client
      .from('departments')
      .insert({
        organization_id: input.organizationId,
        business_unit_id: input.businessUnitId ?? null,
        office_id: input.officeId ?? null,
        parent_department_id: input.parentDepartmentId ?? null,
        name: input.name,
        code: input.code,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Department')
    return mapDepartment(data)
  }

  async updateDepartment(id: string, input: DepartmentUpdateInput): Promise<Department> {
    const { data, error } = await this.client
      .from('departments')
      .update({
        ...(input.businessUnitId !== undefined && { business_unit_id: input.businessUnitId }),
        ...(input.officeId !== undefined && { office_id: input.officeId }),
        ...(input.parentDepartmentId !== undefined && { parent_department_id: input.parentDepartmentId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Department')
    return mapDepartment(data)
  }

  async archiveDepartment(id: string): Promise<Department> {
    const { data, error } = await this.client
      .from('departments')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Department')
    return mapDepartment(data)
  }

  async findPositionById(id: string): Promise<Position | null> {
    const { data, error } = await this.client.from('positions').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Position')
    return data ? mapPosition(data) : null
  }

  async listPositionsByDepartment(departmentId: string): Promise<Position[]> {
    const { data, error } = await this.client
      .from('positions')
      .select('*')
      .eq('department_id', departmentId)
      .order('title')
    if (error) throw mapDatabaseError(error, 'Position')
    return (data ?? []).map(mapPosition)
  }

  async createPosition(input: PositionCreateInput): Promise<Position> {
    const { data, error } = await this.client
      .from('positions')
      .insert({ department_id: input.departmentId, title: input.title, level: input.level ?? null })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Position')
    return mapPosition(data)
  }

  async updatePosition(id: string, input: PositionUpdateInput): Promise<Position> {
    const { data, error } = await this.client
      .from('positions')
      .update({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.level !== undefined && { level: input.level }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Position')
    return mapPosition(data)
  }

  async archivePosition(id: string): Promise<Position> {
    const { data, error } = await this.client
      .from('positions')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Position')
    return mapPosition(data)
  }
}
