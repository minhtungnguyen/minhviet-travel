import { describe, expect, it, vi } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { SeoService } from '@/modules/seo/application/seo.service'
import type { SeoRepository } from '@/modules/seo/infrastructure/seo.repository'
import type { RedirectRule } from '@/modules/seo/domain/types'

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['MARKETING'],
    permissions: new Set(['seo.redirect.update']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

function makeFakeClient(organizationId = 'org-1'): SupabaseClientLike {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { brand_id: 'brand-1', brands: { organization_id: organizationId } }, error: null }),
        }),
      }),
    }),
  } as unknown as SupabaseClientLike
}

function makeRule(overrides: Partial<RedirectRule> = {}): RedirectRule {
  return {
    id: 'redirect-1',
    websiteId: 'site-1',
    locale: null,
    sourcePath: '/old-page',
    destinationUrl: '/new-page',
    redirectKind: '301',
    status: 'ACTIVE',
    hitCount: 0,
    ...overrides,
  }
}

function makeFakeRepository(rules: RedirectRule[], overrides: Partial<SeoRepository> = {}): SeoRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  return {
    findMetadata: notUsed,
    upsertMetadata: notUsed,
    findMetadataByCanonicalUrl: notUsed,
    recordSlugHistory: notUsed,
    listRedirects: async () => rules,
    findRedirectById: async (id) => rules.find((r) => r.id === id) ?? null,
    findRedirectBySourcePath: async (_websiteId, sourcePath) => rules.find((r) => r.sourcePath === sourcePath) ?? null,
    createRedirect: async (input) => makeRule({ id: 'new-redirect', sourcePath: input.sourcePath, destinationUrl: input.destinationUrl }),
    updateRedirect: notUsed,
    deleteRedirect: notUsed,
    ...overrides,
  }
}

const noopAuditLogger = vi.fn(async () => {})

describe('SeoService — redirect loop rejection', () => {
  it('rejects a redirect whose destination is its own source path', async () => {
    const service = new SeoService(makeFakeRepository([]), makeFakeClient(), noopAuditLogger)
    await expect(
      service.createRedirect(makeActor(), { websiteId: 'site-1', sourcePath: '/a', destinationUrl: '/a', redirectKind: '301' }, 'req-1'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('rejects a direct 2-hop loop: /a -> /b already exists, creating /b -> /a would close the loop', async () => {
    const existing = [makeRule({ id: 'r1', sourcePath: '/a', destinationUrl: '/b' })]
    const service = new SeoService(makeFakeRepository(existing), makeFakeClient(), noopAuditLogger)
    await expect(
      service.createRedirect(makeActor(), { websiteId: 'site-1', sourcePath: '/b', destinationUrl: '/a', redirectKind: '301' }, 'req-1'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('rejects a longer chain loop: /a->/b->/c exists, creating /c->/a would close it', async () => {
    const existing = [
      makeRule({ id: 'r1', sourcePath: '/a', destinationUrl: '/b' }),
      makeRule({ id: 'r2', sourcePath: '/b', destinationUrl: '/c' }),
    ]
    const service = new SeoService(makeFakeRepository(existing), makeFakeClient(), noopAuditLogger)
    await expect(
      service.createRedirect(makeActor(), { websiteId: 'site-1', sourcePath: '/c', destinationUrl: '/a', redirectKind: '301' }, 'req-1'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('allows a normal, non-looping redirect chain', async () => {
    const existing = [makeRule({ id: 'r1', sourcePath: '/a', destinationUrl: '/b' })]
    const service = new SeoService(makeFakeRepository(existing), makeFakeClient(), noopAuditLogger)
    await expect(
      service.createRedirect(makeActor(), { websiteId: 'site-1', sourcePath: '/x', destinationUrl: '/y', redirectKind: '301' }, 'req-1'),
    ).resolves.toMatchObject({ sourcePath: '/x', destinationUrl: '/y' })
  })

  it('rejects a duplicate source path on the same website', async () => {
    const existing = [makeRule({ id: 'r1', sourcePath: '/a', destinationUrl: '/b' })]
    const service = new SeoService(makeFakeRepository(existing), makeFakeClient(), noopAuditLogger)
    await expect(
      service.createRedirect(makeActor(), { websiteId: 'site-1', sourcePath: '/a', destinationUrl: '/z', redirectKind: '301' }, 'req-1'),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})
