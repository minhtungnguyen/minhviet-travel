import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type {
  EmployeeProfile,
  OrganizationMembership,
  Permission,
  Role,
  UserProfile,
  UserRole,
  UserWebsiteAccess,
} from '@/modules/access-control/domain/types'
import type {
  AssignRoleInput,
  EmployeeProfileUpdateInput,
  GrantWebsiteAccessInput,
  UserAdminUpdateInput,
  UserProfileUpdateInput,
} from '@/modules/access-control/schemas/access-control.schema'

export interface AccessControlRepository {
  findUserProfileById(id: string): Promise<UserProfile | null>
  listUserProfiles(query: PaginationQuery): Promise<PaginatedResult<UserProfile>>
  updateUserProfile(id: string, input: UserProfileUpdateInput | UserAdminUpdateInput): Promise<UserProfile>

  findEmployeeProfileByUserProfileId(userProfileId: string): Promise<EmployeeProfile | null>
  upsertEmployeeProfile(userProfileId: string, input: EmployeeProfileUpdateInput): Promise<EmployeeProfile>

  findOrganizationMembership(userProfileId: string): Promise<OrganizationMembership | null>

  listRoles(): Promise<Role[]>
  findRoleById(id: string): Promise<Role | null>
  listPermissions(): Promise<Permission[]>
  /** Full role↔permission grant matrix — powers the Admin Shell's Roles & Permissions screen. */
  listRolePermissionPairs(): Promise<{ roleId: string; permissionId: string }[]>

  listUserRoles(userProfileId: string): Promise<UserRole[]>
  assignRole(input: AssignRoleInput, actorId: string): Promise<UserRole>
  revokeRole(userProfileId: string, roleId: string): Promise<void>
  /** Count of distinct users currently holding the SUPER_ADMIN role — for the last-admin guard. */
  countActiveSuperAdmins(): Promise<number>

  /** Effective permission keys across every role the user holds, any scope. */
  listEffectivePermissions(userProfileId: string): Promise<Permission[]>

  listUserWebsiteAccess(userProfileId: string): Promise<UserWebsiteAccess[]>
  grantWebsiteAccess(input: GrantWebsiteAccessInput): Promise<UserWebsiteAccess>
  revokeWebsiteAccess(userProfileId: string, websiteId: string): Promise<void>
}

type UserProfileRow = {
  id: string
  display_name: string
  avatar_media_id: string | null
  locale: string
  timezone: string
  account_status: string
  last_login_at: string | null
  created_at: string
}

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarMediaId: row.avatar_media_id,
    locale: row.locale,
    timezone: row.timezone,
    accountStatus: row.account_status as UserProfile['accountStatus'],
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  }
}

type EmployeeProfileRow = {
  id: string
  user_profile_id: string
  employee_code: string | null
  department_id: string | null
  position_id: string | null
  office_id: string | null
  manager_id: string | null
  hire_date: string | null
}

function mapEmployeeProfile(row: EmployeeProfileRow): EmployeeProfile {
  return {
    id: row.id,
    userProfileId: row.user_profile_id,
    employeeCode: row.employee_code,
    departmentId: row.department_id,
    positionId: row.position_id,
    officeId: row.office_id,
    managerId: row.manager_id,
    hireDate: row.hire_date,
  }
}

type RoleRow = {
  id: string
  key: string
  name: string
  description: string | null
  is_system: boolean
}

function mapRole(row: RoleRow): Role {
  return { id: row.id, key: row.key, name: row.name, description: row.description, isSystem: row.is_system }
}

type PermissionRow = { id: string; key: string; module: string; action: string }

function mapPermission(row: PermissionRow): Permission {
  return { id: row.id, key: row.key, module: row.module, action: row.action }
}

type WebsiteAccessRow = { id: string; user_profile_id: string; website_id: string; status: string }

function mapWebsiteAccess(row: WebsiteAccessRow): UserWebsiteAccess {
  return {
    id: row.id,
    userProfileId: row.user_profile_id,
    websiteId: row.website_id,
    status: row.status as UserWebsiteAccess['status'],
  }
}

export class SupabaseAccessControlRepository implements AccessControlRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async findUserProfileById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'UserProfile')
    return data ? mapUserProfile(data) : null
  }

  async listUserProfiles(query: PaginationQuery): Promise<PaginatedResult<UserProfile>> {
    const from = (query.page - 1) * query.pageSize
    let builder = this.client.from('user_profiles').select('*', { count: 'exact' }).is('deleted_at', null)
    if (query.search) builder = builder.ilike('display_name', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'UserProfile')
    return { items: (data ?? []).map(mapUserProfile), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async updateUserProfile(id: string, input: UserProfileUpdateInput | UserAdminUpdateInput): Promise<UserProfile> {
    const accountStatus = 'accountStatus' in input ? input.accountStatus : undefined
    const { data, error } = await this.client
      .from('user_profiles')
      .update({
        ...(input.displayName !== undefined && { display_name: input.displayName }),
        ...(input.locale !== undefined && { locale: input.locale }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
        ...(accountStatus !== undefined && { account_status: accountStatus }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'UserProfile')
    return mapUserProfile(data)
  }

  async findEmployeeProfileByUserProfileId(userProfileId: string): Promise<EmployeeProfile | null> {
    const { data, error } = await this.client
      .from('employee_profiles')
      .select('*')
      .eq('user_profile_id', userProfileId)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'EmployeeProfile')
    return data ? mapEmployeeProfile(data) : null
  }

  async upsertEmployeeProfile(userProfileId: string, input: EmployeeProfileUpdateInput): Promise<EmployeeProfile> {
    const { data, error } = await this.client
      .from('employee_profiles')
      .upsert(
        {
          user_profile_id: userProfileId,
          ...(input.employeeCode !== undefined && { employee_code: input.employeeCode }),
          ...(input.departmentId !== undefined && { department_id: input.departmentId }),
          ...(input.positionId !== undefined && { position_id: input.positionId }),
          ...(input.officeId !== undefined && { office_id: input.officeId }),
          ...(input.managerId !== undefined && { manager_id: input.managerId }),
          ...(input.hireDate !== undefined && { hire_date: input.hireDate }),
        },
        { onConflict: 'user_profile_id' },
      )
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'EmployeeProfile')
    return mapEmployeeProfile(data)
  }

  async findOrganizationMembership(userProfileId: string): Promise<OrganizationMembership | null> {
    const { data, error } = await this.client
      .from('user_organization_memberships')
      .select('*')
      .eq('user_profile_id', userProfileId)
      .eq('status', 'ACTIVE')
      .limit(1)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'OrganizationMembership')
    if (!data) return null
    return {
      id: data.id,
      userProfileId: data.user_profile_id,
      organizationId: data.organization_id,
      status: data.status as OrganizationMembership['status'],
    }
  }

  async listRoles(): Promise<Role[]> {
    const { data, error } = await this.client.from('roles').select('*').order('name')
    if (error) throw mapDatabaseError(error, 'Role')
    return (data ?? []).map(mapRole)
  }

  async findRoleById(id: string): Promise<Role | null> {
    const { data, error } = await this.client.from('roles').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Role')
    return data ? mapRole(data) : null
  }

  async listPermissions(): Promise<Permission[]> {
    const { data, error } = await this.client.from('permissions').select('*').order('module')
    if (error) throw mapDatabaseError(error, 'Permission')
    return (data ?? []).map(mapPermission)
  }

  async listRolePermissionPairs(): Promise<{ roleId: string; permissionId: string }[]> {
    const { data, error } = await this.client.from('role_permissions').select('role_id, permission_id')
    if (error) throw mapDatabaseError(error, 'RolePermission')
    return (data ?? []).map((row) => ({ roleId: row.role_id, permissionId: row.permission_id }))
  }

  async listUserRoles(userProfileId: string): Promise<UserRole[]> {
    const { data, error } = await this.client
      .from('user_roles')
      .select('*')
      .eq('user_profile_id', userProfileId)
    if (error) throw mapDatabaseError(error, 'UserRole')
    return (data ?? []).map((row) => ({
      id: row.id,
      userProfileId: row.user_profile_id,
      roleId: row.role_id,
      scopes: [],
    }))
  }

  async assignRole(input: AssignRoleInput, actorId: string): Promise<UserRole> {
    const { data, error } = await this.client
      .from('user_roles')
      .insert({ user_profile_id: input.userProfileId, role_id: input.roleId, created_by: actorId })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'UserRole')

    if (input.scopes.length > 0) {
      const { error: scopeError } = await this.client.from('role_scopes').insert(
        input.scopes.map((scope) => ({
          user_role_id: data.id,
          scope_level: scope.scopeLevel,
          scope_resource_id: scope.scopeResourceId ?? null,
        })),
      )
      if (scopeError) throw mapDatabaseError(scopeError, 'RoleScope')
    }

    return { id: data.id, userProfileId: data.user_profile_id, roleId: data.role_id, scopes: [] }
  }

  async revokeRole(userProfileId: string, roleId: string): Promise<void> {
    const { error } = await this.client
      .from('user_roles')
      .delete()
      .eq('user_profile_id', userProfileId)
      .eq('role_id', roleId)
    if (error) throw mapDatabaseError(error, 'UserRole')
  }

  async countActiveSuperAdmins(): Promise<number> {
    const { count, error } = await this.client
      .from('user_roles')
      .select('roles!inner(key)', { count: 'exact', head: true })
      .eq('roles.key', 'SUPER_ADMIN')
    if (error) throw mapDatabaseError(error, 'UserRole')
    return count ?? 0
  }

  async listEffectivePermissions(userProfileId: string): Promise<Permission[]> {
    const { data: roleRows, error: roleError } = await this.client
      .from('user_roles')
      .select('role_id')
      .eq('user_profile_id', userProfileId)
    if (roleError) throw mapDatabaseError(roleError, 'UserRole')

    const roleIds = (roleRows ?? []).map((r) => r.role_id)
    if (roleIds.length === 0) return []

    const { data: permRows, error: permError } = await this.client
      .from('role_permissions')
      .select('permissions(id, key, module, action)')
      .in('role_id', roleIds)
    if (permError) throw mapDatabaseError(permError, 'Permission')

    const seen = new Map<string, Permission>()
    for (const row of permRows ?? []) {
      const permission = row.permissions
      if (permission) seen.set(permission.id, mapPermission(permission))
    }
    return Array.from(seen.values())
  }

  async listUserWebsiteAccess(userProfileId: string): Promise<UserWebsiteAccess[]> {
    const { data, error } = await this.client
      .from('user_website_access')
      .select('*')
      .eq('user_profile_id', userProfileId)
    if (error) throw mapDatabaseError(error, 'UserWebsiteAccess')
    return (data ?? []).map(mapWebsiteAccess)
  }

  async grantWebsiteAccess(input: GrantWebsiteAccessInput): Promise<UserWebsiteAccess> {
    const { data, error } = await this.client
      .from('user_website_access')
      .insert({ user_profile_id: input.userProfileId, website_id: input.websiteId })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'UserWebsiteAccess')
    return mapWebsiteAccess(data)
  }

  async revokeWebsiteAccess(userProfileId: string, websiteId: string): Promise<void> {
    const { error } = await this.client
      .from('user_website_access')
      .delete()
      .eq('user_profile_id', userProfileId)
      .eq('website_id', websiteId)
    if (error) throw mapDatabaseError(error, 'UserWebsiteAccess')
  }
}
