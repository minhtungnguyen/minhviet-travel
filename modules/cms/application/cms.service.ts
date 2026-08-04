import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { CmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import type { CmsLifecycleStatus, CmsPageType } from '@/modules/cms/domain/types'
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
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
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

  async listPages(
    actor: ActorContext,
    websiteId: string,
    query: PaginationQuery,
    filters?: { pageType?: CmsPageType; status?: CmsLifecycleStatus; pageIds?: string[] },
  ) {
    requirePermission(actor, 'cms.page.read')
    return this.repository.listPages(websiteId, query, filters)
  }

  /** Live slug-availability check for the admin create form — same rule createPage enforces at submit time (case-insensitive, scoped to website+locale), surfaced earlier so a conflict never reaches submit. */
  async isSlugAvailable(actor: ActorContext, websiteId: string, locale: string, slug: string): Promise<boolean> {
    requirePermission(actor, 'cms.page.create')
    const existing = await this.repository.findPageBySlug(websiteId, locale, slug)
    return !existing
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

  /** Create + its first DRAFT version in one call — the admin "Tạo trang mới" form has no reason to expose 2 separate steps. */
  async createPageWithDraftVersion(actor: ActorContext, input: CmsPageCreateInput, title: string, requestId: string) {
    const page = await this.createPage(actor, input, requestId)
    const version = await this.createVersion(actor, page.id, { title, sections: [] }, requestId)
    return { page, version }
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

  /** Slug uniqueness is (website_id, locale) — try "-copy", "-copy-2", ... until one is free. */
  private async findAvailableDuplicateSlug(websiteId: string, locale: string, baseSlug: string): Promise<string> {
    for (let n = 1; ; n++) {
      const candidate = n === 1 ? `${baseSlug}-copy` : `${baseSlug}-copy-${n}`
      const existing = await this.repository.findPageBySlug(websiteId, locale, candidate)
      if (!existing) return candidate
    }
  }

  /**
   * Clones a page's latest version (sections + blocks, verbatim config)
   * into a brand-new page in DRAFT status with a "-copy" slug — does not
   * touch or reference the original in any way afterwards, so editing
   * the duplicate never affects the source page. SEO metadata is
   * intentionally NOT cloned (a duplicate must never carry the
   * original's canonical URL / OG data as if it were the same page).
   */
  async duplicatePage(actor: ActorContext, pageId: string, requestId: string) {
    requirePermission(actor, 'cms.page.create')
    const original = await this.repository.findPageById(pageId)
    if (!original) throw AppError.notFound('CmsPage', pageId)
    await this.checkWebsiteAccess(actor, original.websiteId)

    const versionId = await this.latestVersionId(pageId)
    const version = await this.repository.findVersionById(versionId)
    if (!version) throw AppError.notFound('CmsPageVersion', versionId)
    const sectionRows = await this.repository.listSections(versionId)
    const blockDefinitions = await this.repository.listBlockDefinitions()
    const keyById = new Map(blockDefinitions.map((d) => [d.id, d.key]))
    const sections = await Promise.all(
      sectionRows.map(async (section) => {
        const blocks = await this.repository.listBlocks(section.id)
        return {
          sectionKey: section.sectionKey,
          position: section.position,
          blocks: blocks.map((b) => ({
            blockDefinitionKey: keyById.get(b.blockDefinitionId) ?? 'CUSTOM',
            position: b.position,
            config: b.config,
          })),
        }
      }),
    )

    const slug = await this.findAvailableDuplicateSlug(original.websiteId, original.locale, original.slug)
    const newPage = await this.createPage(
      actor,
      { websiteId: original.websiteId, locale: original.locale as CmsPageCreateInput['locale'], pageType: original.pageType, slug },
      requestId,
    )
    await this.repository.createVersion(newPage.id, { title: `${version.title} (Copy)`, sections }, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: original.websiteId,
      action: 'cms.page.duplicated',
      entityType: 'cms_page',
      entityId: newPage.id,
      requestId,
      reason: `Duplicated from ${pageId}`,
    })
    return newPage
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

    // Record metadata (docs/backend/admin-os/07-phase4-metadata-migration-preview.md)
    // is distinct from audit_logs below: this is the record's own
    // current-state pointer (who last touched / reviewed / published this
    // version), not the append-only operation history.
    const metadataExtra = {
      updatedBy: actor.userId,
      ...(to === 'APPROVED' && { reviewedBy: actor.userId, reviewedAt: new Date().toISOString() }),
      ...(to === 'PUBLISHED' && { publishedBy: actor.userId }),
    }

    const updated = await this.repository.setVersionStatus(versionId, to, { ...extra, ...metadataExtra })
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

  /**
   * PUBLISHED -> DRAFT. Deliberately does not touch `is_current`:
   * `findPublishedPage` filters on `status = 'PUBLISHED'` in addition to
   * `is_current`, so flipping status alone already removes the page from
   * the public route immediately. Re-publishing later goes through the
   * normal DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED path again.
   */
  unpublish(actor: ActorContext, versionId: string, requestId: string) {
    return this.transition(actor, versionId, 'DRAFT', 'cms.page.update', requestId)
  }

  async unpublishPage(actor: ActorContext, pageId: string, requestId: string) {
    return this.unpublish(actor, await this.latestVersionId(pageId), requestId)
  }

  async listBlockDefinitions() {
    return this.repository.listBlockDefinitions()
  }

  /**
   * Admin-only preview of the page's latest version regardless of status
   * (DRAFT/IN_REVIEW/.../ARCHIVED) — the public site only ever renders
   * `is_current && PUBLISHED` (`getPublicPage`), so this is the only way
   * to see unpublished content rendered before it goes live.
   */
  async getPreviewContent(actor: ActorContext, pageId: string) {
    requirePermission(actor, 'cms.page.read')
    const page = await this.repository.findPageById(pageId)
    if (!page) throw AppError.notFound('CmsPage', pageId)
    await this.checkWebsiteAccess(actor, page.websiteId)
    const versionId = await this.latestVersionId(pageId)
    const version = await this.repository.findVersionById(versionId)
    if (!version) throw AppError.notFound('CmsPageVersion', versionId)
    const sectionRows = await this.repository.listSections(versionId)
    const sections = await Promise.all(
      sectionRows.map(async (section) => ({ ...section, blocks: await this.repository.listBlocks(section.id) })),
    )
    return { page, version, sections }
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

  /**
   * Scheduler V1 (docs/backend/admin-os/08-phase4-completion-report.md):
   * manual due-item processing only — no cron, no background job. An
   * admin with `cms.page.publish` sees the due count, confirms, then
   * `runScheduledPublish` does the actual work. Idempotent by
   * construction: `listDueScheduledVersions` only ever returns rows still
   * in SCHEDULED status, so a version already published by an earlier run
   * (or by an explicit manual publish in the meantime) is never selected
   * again.
   */
  async previewScheduledPublish(actor: ActorContext, websiteId: string) {
    requirePermission(actor, 'cms.page.publish')
    await this.checkWebsiteAccess(actor, websiteId)
    const now = new Date().toISOString()
    const due = await this.repository.listDueScheduledVersions(now)
    const pageWebsiteIds = await Promise.all(due.map((v) => this.repository.findPageById(v.pageId)))
    const dueForWebsite = due.filter((_, i) => pageWebsiteIds[i]?.websiteId === websiteId).length
    const notDueYet = await this.repository.countPendingScheduledVersions(now)
    return { due: dueForWebsite, notDueYet }
  }

  async runScheduledPublish(actor: ActorContext, websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.publish')
    await this.checkWebsiteAccess(actor, websiteId)
    const now = new Date().toISOString()
    const due = await this.repository.listDueScheduledVersions(now)

    let published = 0
    const errors: { versionId: string; message: string }[] = []
    for (const version of due) {
      try {
        const page = await this.repository.findPageById(version.pageId)
        if (!page || page.websiteId !== websiteId) {
          continue // belongs to a different website than this run scoped to — left for that website's own run
        }
        await this.publish(actor, version.id, {}, requestId)
        published++
      } catch (error) {
        errors.push({ versionId: version.id, message: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    const notDueYet = await this.repository.countPendingScheduledVersions(now)
    return { published, notDueYet, errors }
  }

  async deleteAnnouncement(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.announcement.update')
    const existing = await this.repository.findAnnouncementById(id)
    if (!existing) throw AppError.notFound('Announcement', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteAnnouncement(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'cms.announcement.deleted',
      entityType: 'announcement',
      entityId: id,
      requestId,
    })
  }

  /** Public — used by /api/v1/public/sites/{websiteKey}/pages/{slug}. Returns only published, current content. */
  async getPublicPage(websiteId: string, locale: string, slug: string) {
    const result = await this.repository.findPublishedPage(websiteId, locale, slug)
    if (!result) throw AppError.notFound('CmsPage', slug)
    return result
  }
}
