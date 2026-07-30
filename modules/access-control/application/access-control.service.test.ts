import { describe, expect, it } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import type { AccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import type { Role } from '@/modules/access-control/domain/types'

const SUPER_ADMIN: Role = { id: 'role-super-admin', key: 'SUPER_ADMIN', name: 'Super Admin', description: null, isSystem: true }
const VIEWER: Role = { id: 'role-viewer', key: 'VIEWER', name: 'Viewer', description: null, isSystem: false }
const noopAuditLogger = async () => {}

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'admin-1',
    organizationId: 'org-1',
    roles: ['SUPER_ADMIN'],
    permissions: new Set(['user.manage']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

/** In-memory fake — the whole point of the repository-interface split (modules/organization's own header comment). */
function makeFakeRepository(overrides: Partial<AccessControlRepository> = {}): AccessControlRepository {
  return {
    findUserProfileById: async () => null,
    listUserProfiles: async () => ({ items: [], page: 1, pageSize: 20, total: 0 }),
    updateUserProfile: async () => {
      throw new Error('not used in this test')
    },
    findEmployeeProfileByUserProfileId: async () => null,
    upsertEmployeeProfile: async () => {
      throw new Error('not used in this test')
    },
    findOrganizationMembership: async () => null,
    listRoles: async () => [SUPER_ADMIN, VIEWER],
    findRoleById: async (id) => [SUPER_ADMIN, VIEWER].find((r) => r.id === id) ?? null,
    listPermissions: async () => [],
    listRolePermissionPairs: async () => [],
    listUserRoles: async () => [],
    assignRole: async (input) => ({ id: 'ur-1', userProfileId: input.userProfileId, roleId: input.roleId, scopes: [] }),
    revokeRole: async () => {},
    countActiveSuperAdmins: async () => 2,
    listEffectivePermissions: async () => [],
    listUserWebsiteAccess: async () => [],
    grantWebsiteAccess: async () => {
      throw new Error('not used in this test')
    },
    revokeWebsiteAccess: async () => {},
    ...overrides,
  }
}

describe('AccessControlService — self-elevation protection', () => {
  it('denies an admin assigning a role to themselves, regardless of permission held', async () => {
    const service = new AccessControlService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.assignRole(actor, { userProfileId: actor.userId, roleId: SUPER_ADMIN.id, scopes: [] }, 'req-1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('denies an admin revoking their own role', async () => {
    const service = new AccessControlService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.revokeRole(actor, { userProfileId: actor.userId, roleId: SUPER_ADMIN.id }, 'req-1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('allows assigning a role to a different user', async () => {
    const service = new AccessControlService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor()
    const result = await service.assignRole(actor, { userProfileId: 'other-user', roleId: VIEWER.id, scopes: [] }, 'req-1')
    expect(result.userProfileId).toBe('other-user')
  })
})

describe('AccessControlService — last-SUPER_ADMIN protection', () => {
  it('denies revoking SUPER_ADMIN from the last remaining holder', async () => {
    const repository = makeFakeRepository({ countActiveSuperAdmins: async () => 1 })
    const service = new AccessControlService(repository, noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.revokeRole(actor, { userProfileId: 'other-super-admin', roleId: SUPER_ADMIN.id }, 'req-1'),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('allows revoking SUPER_ADMIN when at least one other holder remains', async () => {
    const repository = makeFakeRepository({ countActiveSuperAdmins: async () => 2 })
    const service = new AccessControlService(repository, noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.revokeRole(actor, { userProfileId: 'other-super-admin', roleId: SUPER_ADMIN.id }, 'req-1'),
    ).resolves.toBeUndefined()
  })

  it('does not check super-admin count when revoking a non-SUPER_ADMIN role', async () => {
    let checked = false
    const repository = makeFakeRepository({
      countActiveSuperAdmins: async () => {
        checked = true
        return 1
      },
    })
    const service = new AccessControlService(repository, noopAuditLogger)
    const actor = makeActor()
    await service.revokeRole(actor, { userProfileId: 'other-user', roleId: VIEWER.id }, 'req-1')
    expect(checked).toBe(false)
  })
})

describe('AccessControlService — permission gate', () => {
  it('throws FORBIDDEN when the actor lacks user.manage', async () => {
    const service = new AccessControlService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor({ permissions: new Set() })
    await expect(
      service.assignRole(actor, { userProfileId: 'other-user', roleId: VIEWER.id, scopes: [] }, 'req-1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws NOT_FOUND for a nonexistent role', async () => {
    const service = new AccessControlService(makeFakeRepository(), noopAuditLogger)
    const actor = makeActor()
    await expect(
      service.assignRole(actor, { userProfileId: 'other-user', roleId: 'nonexistent', scopes: [] }, 'req-1'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
