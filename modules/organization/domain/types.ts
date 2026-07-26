/**
 * Domain types for the organization hierarchy (database/migrations/0004_organization.sql).
 * Field names are camelCase mirrors of the snake_case DB columns; mapping
 * happens once, in the repository (modules/organization/infrastructure),
 * so nothing above that layer ever sees a snake_case key.
 */

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type WebsiteStatus = 'ACTIVE' | 'PLANNED' | 'INACTIVE' | 'ARCHIVED'
export type WebsiteType = 'MAIN_SITE' | 'SERVICE_APP' | 'PARTNER_PORTAL' | 'INTERNAL'

export type Organization = {
  id: string
  legalName: string
  displayName: string
  taxCode: string | null
  businessRegistrationNumber: string | null
  countryCode: string | null
  defaultCurrencyCode: string
  defaultLanguageCode: string
  defaultTimezone: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type Brand = {
  id: string
  organizationId: string
  name: string
  slug: string
  displayName: string
  description: string | null
  logoMediaId: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type Website = {
  id: string
  brandId: string
  domain: string
  subdomain: string | null
  name: string
  websiteType: WebsiteType
  defaultLocale: string
  defaultCurrencyCode: string
  themeKey: string
  seoDefaults: Record<string, unknown>
  status: WebsiteStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type BusinessUnit = {
  id: string
  organizationId: string
  code: string
  name: string
  description: string | null
  status: EntityStatus
}

export type Office = {
  id: string
  organizationId: string
  name: string
  city: string | null
  countryCode: string | null
  isHeadquarters: boolean
  status: EntityStatus
}

export type Department = {
  id: string
  organizationId: string
  businessUnitId: string | null
  officeId: string | null
  parentDepartmentId: string | null
  name: string
  code: string
  status: EntityStatus
}

export type Position = {
  id: string
  departmentId: string
  title: string
  level: number | null
  status: EntityStatus
}
