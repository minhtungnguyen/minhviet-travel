import { z } from 'zod'
import { uuidSchema } from '@/shared/validation/common'

export const scopeLevelSchema = z.enum([
  'ORGANIZATION', 'BRAND', 'WEBSITE', 'BUSINESS_UNIT', 'OWN', 'ASSIGNED', 'ALL',
])

export const assignRoleSchema = z.object({
  userProfileId: uuidSchema,
  roleId: uuidSchema,
  scopes: z
    .array(z.object({ scopeLevel: scopeLevelSchema, scopeResourceId: uuidSchema.optional() }))
    .default([]),
}).strict()

/** Body shape for POST /users/{id}/roles — {id} supplies userProfileId. */
export const assignRoleBodySchema = assignRoleSchema.omit({ userProfileId: true })

export const revokeRoleSchema = z.object({
  userProfileId: uuidSchema,
  roleId: uuidSchema,
}).strict()

export const userProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).optional(),
}).strict()

/**
 * Admin-only variant, used only by PATCH /users/{id} (never by the
 * self-service PATCH /users/{id}/profile) — the service's `updateUser`
 * requires `user.manage` unconditionally, so `accountStatus` can never
 * reach the database through the self-service path at all.
 */
export const userAdminUpdateSchema = userProfileUpdateSchema.extend({
  accountStatus: z.enum(['INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'TERMINATED']).optional(),
}).strict()

export const grantWebsiteAccessSchema = z.object({
  userProfileId: uuidSchema,
  websiteId: uuidSchema,
}).strict()

/** Body shape for POST /users/{id}/website-access — {id} supplies userProfileId. */
export const grantWebsiteAccessBodySchema = grantWebsiteAccessSchema.omit({ userProfileId: true })

export const revokeWebsiteAccessSchema = z.object({
  userProfileId: uuidSchema,
  websiteId: uuidSchema,
}).strict()

export const employeeProfileUpdateSchema = z.object({
  employeeCode: z.string().max(50).nullable().optional(),
  departmentId: uuidSchema.nullable().optional(),
  positionId: uuidSchema.nullable().optional(),
  officeId: uuidSchema.nullable().optional(),
  managerId: uuidSchema.nullable().optional(),
  hireDate: z.string().date().nullable().optional(),
}).strict()

export type AssignRoleInput = z.infer<typeof assignRoleSchema>
export type RevokeRoleInput = z.infer<typeof revokeRoleSchema>
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>
export type UserAdminUpdateInput = z.infer<typeof userAdminUpdateSchema>
export type GrantWebsiteAccessInput = z.infer<typeof grantWebsiteAccessSchema>
export type RevokeWebsiteAccessInput = z.infer<typeof revokeWebsiteAccessSchema>
export type EmployeeProfileUpdateInput = z.infer<typeof employeeProfileUpdateSchema>
