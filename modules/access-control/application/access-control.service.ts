import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { AccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import type {
  AssignRoleInput,
  EmployeeProfileUpdateInput,
  GrantWebsiteAccessInput,
  RevokeRoleInput,
  RevokeWebsiteAccessInput,
  UserAdminUpdateInput,
  UserProfileUpdateInput,
} from '@/modules/access-control/schemas/access-control.schema'

const SUPER_ADMIN_ROLE_KEY = 'SUPER_ADMIN'

export class AccessControlService {
  constructor(
    private readonly repository: AccessControlRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async getOwnProfile(actor: ActorContext) {
    const profile = await this.repository.findUserProfileById(actor.userId)
    if (!profile) throw AppError.notFound('UserProfile', actor.userId)
    return profile
  }

  async updateOwnProfile(actor: ActorContext, input: UserProfileUpdateInput, requestId: string) {
    const profile = await this.repository.updateUserProfile(actor.userId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'user_profile.updated',
      entityType: 'user_profile',
      entityId: actor.userId,
      requestId,
    })
    return profile
  }

  async listUsers(actor: ActorContext, query: PaginationQuery) {
    requirePermission(actor, 'user.manage')
    return this.repository.listUserProfiles(query)
  }

  async getUser(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    const profile = await this.repository.findUserProfileById(userProfileId)
    if (!profile) throw AppError.notFound('UserProfile', userProfileId)
    return profile
  }

  /**
   * Self-or-admin variant for PATCH /users/{id}/profile — accepts only
   * `UserProfileUpdateInput` (no `accountStatus`), unlike `updateUser`
   * which is admin-only and accepts the fuller `UserAdminUpdateInput`.
   */
  async updateUserProfile(
    actor: ActorContext,
    userProfileId: string,
    input: UserProfileUpdateInput,
    requestId: string,
  ) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    const existing = await this.repository.findUserProfileById(userProfileId)
    if (!existing) throw AppError.notFound('UserProfile', userProfileId)
    const profile = await this.repository.updateUserProfile(userProfileId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'user_profile.updated',
      entityType: 'user_profile',
      entityId: userProfileId,
      requestId,
    })
    return profile
  }

  async updateUser(actor: ActorContext, userProfileId: string, input: UserAdminUpdateInput, requestId: string) {
    requirePermission(actor, 'user.manage')
    const existing = await this.repository.findUserProfileById(userProfileId)
    if (!existing) throw AppError.notFound('UserProfile', userProfileId)
    const profile = await this.repository.updateUserProfile(userProfileId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'user_profile.admin_updated',
      entityType: 'user_profile',
      entityId: userProfileId,
      requestId,
    })
    return profile
  }

  async getEmployeeProfile(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    return this.repository.findEmployeeProfileByUserProfileId(userProfileId)
  }

  async updateEmployeeProfile(
    actor: ActorContext,
    userProfileId: string,
    input: EmployeeProfileUpdateInput,
    requestId: string,
  ) {
    requirePermission(actor, 'user.manage')
    const employeeProfile = await this.repository.upsertEmployeeProfile(userProfileId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'user_membership.updated',
      entityType: 'employee_profile',
      entityId: employeeProfile.id,
      requestId,
    })
    return employeeProfile
  }

  async getMembership(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    return this.repository.findOrganizationMembership(userProfileId)
  }

  async listRoles() {
    // Reading the role catalog is allowed for any authenticated staff
    // member (role keys/names are not sensitive) — see rls-policy-matrix.md.
    // No `actor` parameter: unlike every other method here, this one
    // never needs one, so it doesn't pretend to.
    return this.repository.listRoles()
  }

  async listPermissions() {
    // Same rationale as listRoles(): the permission catalog isn't secret.
    return this.repository.listPermissions()
  }

  async listUserRoles(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    return this.repository.listUserRoles(userProfileId)
  }

  async assignRole(actor: ActorContext, input: AssignRoleInput, requestId: string) {
    requirePermission(actor, 'user.manage')
    // Self-elevation protection: an admin can grant roles to anyone
    // EXCEPT themselves — closes the "grant myself SUPER_ADMIN" path
    // regardless of what permission the actor currently holds.
    if (input.userProfileId === actor.userId) {
      throw AppError.forbidden('You cannot assign a role to yourself')
    }
    const role = await this.repository.findRoleById(input.roleId)
    if (!role) throw AppError.notFound('Role', input.roleId)
    const userRole = await this.repository.assignRole(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'role.assigned',
      entityType: 'user_role',
      entityId: userRole.id,
      requestId,
      reason: `role=${role.key} target_user=${input.userProfileId}`,
    })
    return userRole
  }

  async revokeRole(actor: ActorContext, input: RevokeRoleInput, requestId: string) {
    requirePermission(actor, 'user.manage')
    if (input.userProfileId === actor.userId) {
      throw AppError.forbidden('You cannot revoke your own role')
    }
    const role = await this.repository.findRoleById(input.roleId)
    if (!role) throw AppError.notFound('Role', input.roleId)

    if (role.key === SUPER_ADMIN_ROLE_KEY) {
      const activeSuperAdmins = await this.repository.countActiveSuperAdmins()
      if (activeSuperAdmins <= 1) {
        throw AppError.conflict('Cannot remove the last active SUPER_ADMIN')
      }
    }

    await this.repository.revokeRole(input.userProfileId, input.roleId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'role.revoked',
      entityType: 'user_role',
      requestId,
      reason: `role=${role.key} target_user=${input.userProfileId}`,
    })
  }

  async listEffectivePermissions(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    return this.repository.listEffectivePermissions(userProfileId)
  }

  async listWebsiteAccess(actor: ActorContext, userProfileId: string) {
    if (userProfileId !== actor.userId) {
      requirePermission(actor, 'user.manage')
    }
    return this.repository.listUserWebsiteAccess(userProfileId)
  }

  async grantWebsiteAccess(actor: ActorContext, input: GrantWebsiteAccessInput, requestId: string) {
    requirePermission(actor, 'user.manage')
    const access = await this.repository.grantWebsiteAccess(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'website_access.granted',
      entityType: 'user_website_access',
      entityId: access.id,
      requestId,
      reason: `target_user=${input.userProfileId}`,
    })
    return access
  }

  async revokeWebsiteAccess(actor: ActorContext, input: RevokeWebsiteAccessInput, requestId: string) {
    requirePermission(actor, 'user.manage')
    await this.repository.revokeWebsiteAccess(input.userProfileId, input.websiteId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'website_access.revoked',
      entityType: 'user_website_access',
      requestId,
      reason: `target_user=${input.userProfileId}`,
    })
  }
}
