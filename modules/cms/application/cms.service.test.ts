import { describe, expect, it, vi } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { CmsService } from '@/modules/cms/application/cms.service'
import type { CmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import type { CmsPage, CmsPageVersion } from '@/modules/cms/domain/types'

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['MANAGER'],
    permissions: new Set(['cms.page.update', 'cms.page.publish', 'cms.page.create', 'cms.page.read']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

/** Answers the one query shape `resolveWebsiteOrganizationId` issues, so `requireWebsiteAccess` always passes for `actor.organizationId`. */
function makeFakeClient(organizationId: string): SupabaseClientLike {
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

const PAGE: CmsPage = {
  id: 'page-1',
  websiteId: 'site-1',
  locale: 'vi',
  pageType: 'STATIC_PAGE',
  slug: 've-chung-toi',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
}

function makeVersion(overrides: Partial<CmsPageVersion> = {}): CmsPageVersion {
  return {
    id: 'version-1',
    pageId: 'page-1',
    versionNumber: 1,
    status: 'DRAFT',
    title: 'About us',
    seoMetadataId: null,
    isCurrent: false,
    scheduledPublishAt: null,
    publishedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: null,
    updatedAt: '2026-01-01T00:00:00Z',
    updatedBy: null,
    reviewedBy: null,
    reviewedAt: null,
    publishedBy: null,
    ...overrides,
  }
}

function makeFakeRepository(version: CmsPageVersion, overrides: Partial<CmsRepository> = {}): CmsRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  return {
    findPageById: async (id) => (id === PAGE.id ? PAGE : null),
    findPageBySlug: notUsed,
    listPages: notUsed,
    createPage: notUsed,
    updatePage: notUsed,
    softDeletePage: notUsed,
    listVersions: async () => [version],
    findVersionById: async (id) => (id === version.id ? version : null),
    findCurrentVersion: notUsed,
    createVersion: notUsed,
    setVersionStatus: async (id, status, extra) => ({ ...version, status, ...(extra.isCurrent !== undefined && { isCurrent: extra.isCurrent }) }),
    listDueScheduledVersions: notUsed,
    countPendingScheduledVersions: notUsed,
    unsetCurrentVersion: async () => {},
    listBlockDefinitions: notUsed,
    findBlockDefinitionByKey: notUsed,
    listSections: notUsed,
    createSection: notUsed,
    updateSection: notUsed,
    deleteSection: notUsed,
    findSectionById: notUsed,
    listBlocks: notUsed,
    createBlock: notUsed,
    updateBlock: notUsed,
    deleteBlock: notUsed,
    findBlockById: notUsed,
    listAnnouncements: notUsed,
    createAnnouncement: notUsed,
    updateAnnouncement: notUsed,
    deleteAnnouncement: notUsed,
    findAnnouncementById: notUsed,
    findPublishedPage: notUsed,
    ...overrides,
  }
}

const noopAuditLogger = vi.fn(async () => {})

describe('CmsService — lifecycle transitions', () => {
  it('DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED is a valid chain', async () => {
    let version = makeVersion({ status: 'DRAFT' })
    const repository = makeFakeRepository(version, {
      findVersionById: async () => version,
      setVersionStatus: async (_id, status, extra) => {
        version = { ...version, status, ...(extra.isCurrent !== undefined && { isCurrent: extra.isCurrent }) }
        return version
      },
    })
    const client = makeFakeClient('org-1')
    const service = new CmsService(repository, client, noopAuditLogger)
    const actor = makeActor()

    await service.submitForReview(actor, 'version-1', 'req-1')
    expect(version.status).toBe('IN_REVIEW')

    await service.approve(actor, 'version-1', 'req-1')
    expect(version.status).toBe('APPROVED')

    await service.publish(actor, 'version-1', {}, 'req-1')
    expect(version.status).toBe('PUBLISHED')
    expect(version.isCurrent).toBe(true)
  })

  it('rejects publishing directly from DRAFT (must go through review first)', async () => {
    const version = makeVersion({ status: 'DRAFT' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    await expect(service.publish(makeActor(), 'version-1', {}, 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('rejects approving a DRAFT version (must be submitted for review first)', async () => {
    const version = makeVersion({ status: 'DRAFT' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    await expect(service.approve(makeActor(), 'version-1', 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('rejects any transition out of ARCHIVED — it is terminal', async () => {
    const version = makeVersion({ status: 'ARCHIVED' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    await expect(service.submitForReview(makeActor(), 'version-1', 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(service.publish(makeActor(), 'version-1', {}, 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('a future scheduledPublishAt moves the version to SCHEDULED, not PUBLISHED', async () => {
    let version = makeVersion({ status: 'APPROVED' })
    const repository = makeFakeRepository(version, {
      findVersionById: async () => version,
      setVersionStatus: async (_id, status, extra) => {
        version = { ...version, status, ...(extra.isCurrent !== undefined && { isCurrent: extra.isCurrent }) }
        return version
      },
    })
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    const future = new Date(Date.now() + 86_400_000).toISOString()
    await service.publish(makeActor(), 'version-1', { scheduledPublishAt: future }, 'req-1')
    expect(version.status).toBe('SCHEDULED')
    expect(version.isCurrent).toBe(false)
  })

  it('denies the transition when the actor lacks cms.page.publish, even if they hold cms.page.update', async () => {
    const version = makeVersion({ status: 'APPROVED' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    const actor = makeActor({ permissions: new Set(['cms.page.update']) })
    await expect(service.publish(actor, 'version-1', {}, 'req-1')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('denies the transition for an actor from a different organization (website isolation)', async () => {
    const version = makeVersion({ status: 'DRAFT' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-OTHER'), noopAuditLogger)
    const actor = makeActor({ organizationId: 'org-1' })
    await expect(service.submitForReview(actor, 'version-1', 'req-1')).rejects.toMatchObject({ code: 'WEBSITE_ACCESS_DENIED' })
  })

  it('Sprint 6: PUBLISHED -> DRAFT (unpublish) is now a valid transition', async () => {
    let version = makeVersion({ status: 'PUBLISHED', isCurrent: true })
    const repository = makeFakeRepository(version, {
      findVersionById: async () => version,
      setVersionStatus: async (_id, status, extra) => {
        version = { ...version, status, ...(extra.isCurrent !== undefined && { isCurrent: extra.isCurrent }) }
        return version
      },
    })
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    await service.unpublishPage(makeActor(), 'page-1', 'req-1')
    expect(version.status).toBe('DRAFT')
    // isCurrent is deliberately untouched — findPublishedPage's status filter alone hides it from the public route.
    expect(version.isCurrent).toBe(true)
  })

  it('ARCHIVED still rejects unpublish — it stays terminal', async () => {
    const version = makeVersion({ status: 'ARCHIVED' })
    const repository = makeFakeRepository(version)
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    await expect(service.unpublishPage(makeActor(), 'page-1', 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})

describe('CmsService — Sprint 6 additions', () => {
  it('isSlugAvailable is true when no page has that slug, false when one does', async () => {
    const version = makeVersion()
    const repository = makeFakeRepository(version, {
      findPageBySlug: async (_websiteId, _locale, slug) => (slug === 'taken-slug' ? PAGE : null),
    })
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    const actor = makeActor()
    await expect(service.isSlugAvailable(actor, 'site-1', 'vi', 'taken-slug')).resolves.toBe(false)
    await expect(service.isSlugAvailable(actor, 'site-1', 'vi', 'free-slug')).resolves.toBe(true)
  })

  it('duplicatePage clones sections/blocks into a new page with a "-copy" slug, and skips slugs already taken', async () => {
    const version = makeVersion({ title: 'About us' })
    const definitions = [{ id: 'def-rich-text', key: 'RICH_TEXT', name: 'Rich Text', configSchema: {}, status: 'ACTIVE' as const }]
    const sections = [{ id: 'section-1', pageVersionId: version.id, sectionKey: 'content', position: 0 }]
    const blocks = [{ id: 'block-1', sectionId: 'section-1', blockDefinitionId: 'def-rich-text', position: 0, config: { body: 'hello' } }]
    const existingSlugs = new Set(['ve-chung-toi', 've-chung-toi-copy'])
    const createdVersions: { pageId: string; sections: unknown }[] = []

    const repository = makeFakeRepository(version, {
      findPageById: async (id) => (id === PAGE.id ? PAGE : null),
      findPageBySlug: async (_w, _l, slug) => (existingSlugs.has(slug) ? { ...PAGE, slug } : null),
      createPage: async (input) => ({ ...PAGE, id: 'page-2', slug: input.slug, pageType: input.pageType }),
      listSections: async () => sections,
      listBlocks: async () => blocks,
      listBlockDefinitions: async () => definitions,
      createVersion: async (pageId, input) => {
        createdVersions.push({ pageId, sections: input.sections })
        return makeVersion({ id: 'version-2', pageId, title: input.title })
      },
    })
    const service = new CmsService(repository, makeFakeClient('org-1'), noopAuditLogger)
    const newPage = await service.duplicatePage(makeActor(), 'page-1', 'req-1')

    // "-copy" is already taken (existingSlugs) — must skip it and land on "-copy-2".
    expect(newPage.slug).toBe('ve-chung-toi-copy-2')
    expect(createdVersions).toHaveLength(1)
    expect(createdVersions[0].sections).toEqual([
      { sectionKey: 'content', position: 0, blocks: [{ blockDefinitionKey: 'RICH_TEXT', position: 0, config: { body: 'hello' } }] },
    ])
  })
})
