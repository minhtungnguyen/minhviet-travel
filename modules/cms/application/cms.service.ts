import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { CmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import type { CmsLifecycleStatus } from '@/modules/cms/domain/types'
import type {
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
  CmsBlockUpdateInput,
  CmsPageCreateInput,
  CmsPageUpdateInput,
  CmsPageVersionCreateInput,
  CmsSectionUpdateInput,
  PublishVersionInput,
} from '@/modules/cms/schemas/cms.schema'

const VALID_TRANSITIONS: Record<string, CmsLifecycleStatus[]> = {
  DRAFT: ['IN_REVIEW', 'ARCHIVED'],
  IN_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['PUBLISHED', 'SCHEDULED', 'IN_REVIEW', 'ARCHIVED'],
  SCHEDULED: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
}

function assertTransition(from: CmsLifecycleStatus, to: CmsLifecycleStatus) {
  if (!VALID_TRANSITIONS[from]?.includes(to)) {
    throw AppError.conflict(`Cannot move a page version from ${from} to ${to}`)
  }
}

/**
 * Every mutation resolves the target website's owning organization and
 * calls `requireWebsiteAccess` in addition to the coarse `cms.page.*`
 * permission check — this is what actually makes multi-website
 * publishing safe today: a MANAGER granted `user_website_access` to only
 * some of an organization's future websites (Minh Viet Booking, MIVIGO,
 * Checkin Cat Ba, ...) is blocked from touching the others, not just
 * "supported eventually."
 */
export class CmsService {
  constructor(
    private readonly repository: CmsRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async getPage(id: string) {
    const page = await this.repository.findPageById(id)
    if (!page) throw AppError.notFound('CmsPage', id)
    return page
  }

  async listPages(actor: ActorContext, websiteId: string, query: PaginationQuery) {
    requirePermission(actor, 'cms.page.read')
    return this.repository.listPages(websiteId, query)
  }

  async createPage(actor: ActorContext, input: CmsPageCreateInput, requestId: string) {
    requirePermission(actor, 'cms.page.create')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const existing = await this.repository.findPageBySlug(input.websiteId, input.locale, input.slug)
    if (existing) throw AppError.conflict(`Slug "${input.slug}" is already used on this website/locale`)
    const page = await this.repository.createPage(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: page.websiteId,
      action: 'cms.page.created',
      entityType: 'cms_page',
      entityId: page.id,
      requestId,
    })
    return page
  }

  async updatePage(actor: ActorContext, id: string, input: CmsPageUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findPageById(id)
    if (!existing) throw AppError.notFound('CmsPage', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    if (input.slug && input.slug !== existing.slug) {
      const conflict = await this.repository.findPageBySlug(existing.websiteId, existing.locale, input.slug)
      if (conflict) throw AppError.conflict(`Slug "${input.slug}" is already used on this website/locale`)
    }
    const page = await this.repository.updatePage(id, input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'cms.page.updated',
      entityType: 'cms_page',
      entityId: id,
      requestId,
    })
    return page
  }

  async deletePage(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.page.delete')
    const existing = await this.repository.findPageById(id)
    if (!existing) throw AppError.notFound('CmsPage', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.softDeletePage(id, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'cms.page.deleted',
      entityType: 'cms_page',
      entityId: id,
      requestId,
    })
  }

  async listVersions(actor: ActorContext, pageId: string) {
    requirePermission(actor, 'cms.page.read')
    return this.repository.listVersions(pageId)
  }

  async createVersion(actor: ActorContext, pageId: string, input: CmsPageVersionCreateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const page = await this.repository.findPageById(pageId)
    if (!page) throw AppError.notFound('CmsPage', pageId)
    await this.checkWebsiteAccess(actor, page.websiteId)
    const version = await this.repository.createVersion(pageId, input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: page.websiteId,
      action: 'cms.page_version.created',
      entityType: 'cms_page_version',
      entityId: version.id,
      requestId,
    })
    return version
  }

  private async transition(
    actor: ActorContext,
    versionId: string,
    to: CmsLifecycleStatus,
    permission: string,
    requestId: string,
    extra: { isCurrent?: boolean; publishedAt?: string | null; scheduledPublishAt?: string | null } = {},
  ) {
    requirePermission(actor, permission)
    const version = await this.repository.findVersionById(versionId)
    if (!version) throw AppError.notFound('CmsPageVersion', versionId)
    const page = await this.repository.findPageById(version.pageId)
    if (!page) throw AppError.notFound('CmsPage', version.pageId)
    await this.checkWebsiteAccess(actor, page.websiteId)
    assertTransition(version.status, to)

    if (extra.isCurrent) {
      // Two-step, not a single transaction (no RPC added — schema stays
      // untouched this sprint): unset the old current version first so
      // the partial unique index on (page_id) WHERE is_current never
      // sees two true rows at once. A brief zero-current window is the
      // accepted tradeoff over a rejected write.
      await this.repository.unsetCurrentVersion(page.id)
    }

    const updated = await this.repository.setVersionStatus(versionId, to, extra)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: page.websiteId,
      action: `cms.page_version.${to.toLowerCase()}`,
      entityType: 'cms_page_version',
      entityId: versionId,
      requestId,
    })
    return updated
  }

  submitForReview(actor: ActorContext, versionId: string, requestId: string) {
    return this.transition(actor, versionId, 'IN_REVIEW', 'cms.page.update', requestId)
  }

  approve(actor: ActorContext, versionId: string, requestId: string) {
    return this.transition(actor, versionId, 'APPROVED', 'cms.page.update', requestId)
  }

  /**
   * `pages/{id}/{submit-review,approve,publish,archive}` (the spec's
   * suggested shape) operate on a page's most recent version implicitly
   * — the version-scoped methods above remain available directly for a
   * reviewer working across several pages' pending versions at once.
   */
  private async latestVersionId(pageId: string): Promise<string> {
    const versions = await this.repository.listVersions(pageId)
    const latest = versions[0]
    if (!latest) throw AppError.notFound('CmsPageVersion', pageId)
    return latest.id
  }

  async submitPageForReview(actor: ActorContext, pageId: string, requestId: string) {
    return this.submitForReview(actor, await this.latestVersionId(pageId), requestId)
  }

  async approvePage(actor: ActorContext, pageId: string, requestId: string) {
    return this.approve(actor, await this.latestVersionId(pageId), requestId)
  }

  async publishPage(actor: ActorContext, pageId: string, input: PublishVersionInput, requestId: string) {
    return this.publish(actor, await this.latestVersionId(pageId), input, requestId)
  }

  async archivePage(actor: ActorContext, pageId: string, requestId: string) {
    return this.archive(actor, await this.latestVersionId(pageId), requestId)
  }

  async publish(actor: ActorContext, versionId: string, input: PublishVersionInput, requestId: string) {
    const scheduledInFuture = input.scheduledPublishAt && new Date(input.scheduledPublishAt) > new Date()
    if (scheduledInFuture) {
      return this.transition(actor, versionId, 'SCHEDULED', 'cms.page.publish', requestId, {
        scheduledPublishAt: input.scheduledPublishAt,
      })
    }
    // Immediate publish, or a SCHEDULED version whose time has come —
    // no background scheduler runs this automatically (spec §12: "no
    // scheduler is required yet"), a second explicit call does.
    return this.transition(actor, versionId, 'PUBLISHED', 'cms.page.publish', requestId, {
      isCurrent: true,
      publishedAt: new Date().toISOString(),
    })
  }

  archive(actor: ActorContext, versionId: string, requestId: string) {
    return this.transition(actor, versionId, 'ARCHIVED', 'cms.page.update', requestId)
  }

  async listBlockDefinitions() {
    return this.repository.listBlockDefinitions()
  }

  async listSections(actor: ActorContext, pageId: string) {
    requirePermission(actor, 'cms.page.read')
    const versionId = await this.latestVersionId(pageId)
    return this.repository.listSections(versionId)
  }

  async createSection(actor: ActorContext, pageId: string, sectionKey: string, position: number, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const versionId = await this.latestVersionId(pageId)
    const section = await this.repository.createSection(versionId, sectionKey, position)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.section.created',
      entityType: 'cms_section',
      entityId: section.id,
      requestId,
    })
    return section
  }

  async listBlocks(actor: ActorContext, sectionId: string) {
    requirePermission(actor, 'cms.page.read')
    return this.repository.listBlocks(sectionId)
  }

  async createBlock(
    actor: ActorContext,
    sectionId: string,
    blockDefinitionKey: string,
    position: number,
    config: Record<string, unknown>,
    requestId: string,
  ) {
    requirePermission(actor, 'cms.page.update')
    const block = await this.repository.createBlock(sectionId, blockDefinitionKey, position, config)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.block.created',
      entityType: 'cms_block',
      entityId: block.id,
      requestId,
    })
    return block
  }

  async updateSection(actor: ActorContext, id: string, input: CmsSectionUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findSectionById(id)
    if (!existing) throw AppError.notFound('CmsSection', id)
    const section = await this.repository.updateSection(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.section.updated',
      entityType: 'cms_section',
      entityId: id,
      requestId,
    })
    return section
  }

  async deleteSection(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findSectionById(id)
    if (!existing) throw AppError.notFound('CmsSection', id)
    await this.repository.deleteSection(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.section.deleted',
      entityType: 'cms_section',
      entityId: id,
      requestId,
    })
  }

  async updateBlock(actor: ActorContext, id: string, input: CmsBlockUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findBlockById(id)
    if (!existing) throw AppError.notFound('CmsBlock', id)
    const block = await this.repository.updateBlock(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.block.updated',
      entityType: 'cms_block',
      entityId: id,
      requestId,
    })
    return block
  }

  async deleteBlock(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findBlockById(id)
    if (!existing) throw AppError.notFound('CmsBlock', id)
    await this.repository.deleteBlock(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'cms.block.deleted',
      entityType: 'cms_block',
      entityId: id,
      requestId,
    })
  }

  async listAnnouncements(websiteId: string) {
    return this.repository.listAnnouncements(websiteId)
  }

  async createAnnouncement(actor: ActorContext, input: AnnouncementCreateInput, requestId: string) {
    requirePermission(actor, 'cms.announcement.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const announcement = await this.repository.createAnnouncement(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'cms.announcement.created',
      entityType: 'announcement',
      entityId: announcement.id,
      requestId,
    })
    return announcement
  }

  async updateAnnouncement(actor: ActorContext, id: string, input: AnnouncementUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.announcement.update')
    const existing = await this.repository.findAnnouncementById(id)
    if (!existing) throw AppError.notFound('Announcement', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const announcement = await this.repository.updateAnnouncement(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'cms.announcement.updated',
      entityType: 'announcement',
      entityId: id,
      requestId,
    })
    return announcement
  }

  /** Public — used by /api/v1/public/sites/{websiteKey}/pages/{slug}. Returns only published, current content. */
  async getPublicPage(websiteId: string, locale: string, slug: string) {
    const result = await this.repository.findPublishedPage(websiteId, locale, slug)
    if (!result) throw AppError.notFound('CmsPage', slug)
    return result
  }
}
