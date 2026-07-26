import { describe, expect, it } from 'vitest'
import { AppError } from '@/shared/errors/app-error'
import {
  requireActiveMembership,
  requireAnyPermission,
  requirePermission,
  requireWebsiteAccess,
  type ActorContext,
} from '@/shared/auth/guards'

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['VIEWER'],
    permissions: new Set(['cms.page.read']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

describe('requirePermission', () => {
  it('passes when the actor holds the permission', () => {
    expect(() => requirePermission(makeActor(), 'cms.page.read')).not.toThrow()
  })

  it('throws FORBIDDEN when the actor lacks the permission', () => {
    const actor = makeActor()
    expect(() => requirePermission(actor, 'role.manage')).toThrow(AppError)
    try {
      requirePermission(actor, 'role.manage')
    } catch (error) {
      expect((error as AppError).code).toBe('FORBIDDEN')
    }
  })
})

describe('requireAnyPermission', () => {
  it('passes if the actor holds at least one of the listed permissions', () => {
    const actor = makeActor({ permissions: new Set(['audit.read']) })
    expect(() => requireAnyPermission(actor, ['role.manage', 'audit.read'])).not.toThrow()
  })

  it('throws FORBIDDEN when the actor holds none of the listed permissions', () => {
    const actor = makeActor({ permissions: new Set() })
    expect(() => requireAnyPermission(actor, ['role.manage', 'user.manage'])).toThrow(AppError)
  })
})

describe('requireActiveMembership', () => {
  it('passes when organizationId is set', () => {
    expect(() => requireActiveMembership(makeActor({ organizationId: 'org-1' }))).not.toThrow()
  })

  it('throws MEMBERSHIP_REQUIRED when organizationId is null (authenticated, no active membership)', () => {
    const actor = makeActor({ organizationId: null })
    expect(() => requireActiveMembership(actor)).toThrow(AppError)
    try {
      requireActiveMembership(actor)
    } catch (error) {
      expect((error as AppError).code).toBe('MEMBERSHIP_REQUIRED')
    }
  })
})

describe('requireWebsiteAccess', () => {
  const website = { id: 'site-1', organizationId: 'org-1' }

  it('passes when the website belongs to the actor organization (org-wide access)', () => {
    const actor = makeActor({ organizationId: 'org-1', websiteIds: [] })
    expect(() => requireWebsiteAccess(actor, website)).not.toThrow()
  })

  it('passes via an explicit user_website_access grant even without organization-wide access', () => {
    const actor = makeActor({ organizationId: null, websiteIds: ['site-1'] })
    expect(() => requireWebsiteAccess(actor, website)).not.toThrow()
  })

  it('throws WEBSITE_ACCESS_DENIED when neither org-wide nor an explicit grant applies', () => {
    const actor = makeActor({ organizationId: 'org-2', websiteIds: ['site-9'] })
    expect(() => requireWebsiteAccess(actor, website)).toThrow(AppError)
    try {
      requireWebsiteAccess(actor, website)
    } catch (error) {
      expect((error as AppError).code).toBe('WEBSITE_ACCESS_DENIED')
    }
  })

  it('cross-organization access is denied even if the website id happens to match another org member list (isolation)', () => {
    // Regression guard for the exact leak class Sprint 1B.1's RLS matrix tested at the DB layer —
    // this is the service-layer equivalent check.
    const actorFromOtherOrg = makeActor({ organizationId: 'org-999', websiteIds: [] })
    expect(() => requireWebsiteAccess(actorFromOtherOrg, website)).toThrow(AppError)
  })
})
