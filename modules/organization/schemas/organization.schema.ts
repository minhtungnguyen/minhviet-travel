import { z } from 'zod'
import { generalStatusSchema, slugSchema, uuidSchema } from '@/shared/validation/common'

/**
 * Every field an API consumer may set. Server-generated fields (id,
 * createdAt, updatedAt) are never accepted from the client — see
 * docs/api/api-conventions.md "Reject unexpected fields when appropriate."
 */
export const organizationCreateSchema = z.object({
  legalName: z.string().min(1).max(200),
  displayName: z.string().min(1).max(200),
  taxCode: z.string().max(50).optional(),
  businessRegistrationNumber: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional(),
  defaultCurrencyCode: z.string().length(3),
  defaultLanguageCode: z.string().min(2).max(10),
  defaultTimezone: z.string().min(1).default('Asia/Ho_Chi_Minh'),
}).strict()

export const organizationUpdateSchema = organizationCreateSchema.partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const brandCreateSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(1).max(200),
  slug: slugSchema,
  displayName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  logoMediaId: uuidSchema.optional(),
}).strict()

export const brandUpdateSchema = brandCreateSchema.omit({ organizationId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const websiteCreateSchema = z.object({
  brandId: uuidSchema,
  domain: z.string().min(1).max(255),
  subdomain: z.string().max(100).optional(),
  name: z.string().min(1).max(200),
  websiteType: z.enum(['MAIN_SITE', 'SERVICE_APP', 'PARTNER_PORTAL', 'INTERNAL']).default('MAIN_SITE'),
  defaultLocale: z.string().min(2).max(10),
  defaultCurrencyCode: z.string().length(3),
  themeKey: z.string().min(1).default('default'),
}).strict()

export const websiteUpdateSchema = websiteCreateSchema.omit({ brandId: true }).partial().extend({
  status: z.enum(['ACTIVE', 'PLANNED', 'INACTIVE', 'ARCHIVED']).optional(),
}).strict()

/**
 * Business units, departments and positions are scoped to `organization_id`
 * — never `brand_id` — so they stay reusable across every brand under an
 * organization by construction (database/migrations/0004_organization.sql).
 * None of these three tables (nor `offices`) has a `created_by`/`updated_by`
 * column, so no `actorId` is threaded into their repository writes; "delete"
 * is a status transition to `ARCHIVED` (none of these tables has
 * `deleted_at` either), not a SQL `DELETE`.
 */
export const businessUnitCreateSchema = z.object({
  organizationId: uuidSchema,
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
}).strict()

export const businessUnitUpdateSchema = businessUnitCreateSchema.omit({ organizationId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const officeCreateSchema = z.object({
  organizationId: uuidSchema,
  name: z.string().min(1).max(200),
  addressLine1: z.string().max(300).optional(),
  addressLine2: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  countryCode: z.string().length(2).optional(),
  phone: z.string().max(50).optional(),
  isHeadquarters: z.boolean().default(false),
}).strict()

export const officeUpdateSchema = officeCreateSchema.omit({ organizationId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const departmentCreateSchema = z.object({
  organizationId: uuidSchema,
  businessUnitId: uuidSchema.optional(),
  officeId: uuidSchema.optional(),
  parentDepartmentId: uuidSchema.optional(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
}).strict()

export const departmentUpdateSchema = departmentCreateSchema.omit({ organizationId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const positionCreateSchema = z.object({
  departmentId: uuidSchema,
  title: z.string().min(1).max(200),
  level: z.number().int().min(0).max(50).optional(),
}).strict()

export const positionUpdateSchema = positionCreateSchema.omit({ departmentId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
export type BrandCreateInput = z.infer<typeof brandCreateSchema>
export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>
export type WebsiteCreateInput = z.infer<typeof websiteCreateSchema>
export type WebsiteUpdateInput = z.infer<typeof websiteUpdateSchema>
export type BusinessUnitCreateInput = z.infer<typeof businessUnitCreateSchema>
export type BusinessUnitUpdateInput = z.infer<typeof businessUnitUpdateSchema>
export type OfficeCreateInput = z.infer<typeof officeCreateSchema>
export type OfficeUpdateInput = z.infer<typeof officeUpdateSchema>
export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>
export type PositionCreateInput = z.infer<typeof positionCreateSchema>
export type PositionUpdateInput = z.infer<typeof positionUpdateSchema>
