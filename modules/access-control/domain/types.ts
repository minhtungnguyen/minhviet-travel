/**
 * Domain types for identity + RBAC (database/migrations/0005_identity_and_rbac.sql).
 * Combined into one module per sprint-1-implementation-plan.md §2.
 */

export type AccountStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'TERMINATED'
export type PermissionScopeLevel =
  | 'ORGANIZATION'
  | 'BRAND'
  | 'WEBSITE'
  | 'BUSINESS_UNIT'
  | 'OWN'
  | 'ASSIGNED'
  | 'ALL'

export type UserProfile = {
  id: string
  displayName: string
  avatarMediaId: string | null
  locale: string
  timezone: string
  accountStatus: AccountStatus
  lastLoginAt: string | null
  createdAt: string
}

export type EmployeeProfile = {
  id: string
  userProfileId: string
  employeeCode: string | null
  departmentId: string | null
  positionId: string | null
  officeId: string | null
  managerId: string | null
  hireDate: string | null
}

/** The fixed 8 roles seeded in Sprint 1 — see sprint-1-implementation-plan.md §1.2. */
export type RoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES'
  | 'BOOKING'
  | 'OPERATION'
  | 'MARKETING'
  | 'VIEWER'

export type Role = {
  id: string
  key: RoleKey | string
  name: string
  description: string | null
  isSystem: boolean
}

export type Permission = {
  id: string
  key: string
  module: string
  action: string
}

export type UserRole = {
  id: string
  userProfileId: string
  roleId: string
  scopes: RoleScope[]
}

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type UserWebsiteAccess = {
  id: string
  userProfileId: string
  websiteId: string
  status: EntityStatus
}

export type OrganizationMembership = {
  id: string
  userProfileId: string
  organizationId: string
  status: EntityStatus
}

export type RoleScope = {
  id: string
  userRoleId: string
  scopeLevel: PermissionScopeLevel
  scopeResourceId: string | null
}
