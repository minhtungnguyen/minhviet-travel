import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { TourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import type { TourCategoryCreateInput, TourCategoryUpdateInput } from '@/modules/tour-categories/schemas/tour-category.schema'

/**
 * Tour categories reuse `cms.page.update` (a Tour is `cms_pages`,
 * categories are CMS content structure) — no dedicated permission, same
 * RBAC discipline as news-categories (docs/backend/admin-os/
 * 05-rbac-gap-report.md).
 */
export class TourCategoryService {
  constructor(
    private readonly repository: TourCategoryRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listCategories(websiteId: string) {
    return this.repository.listCategories(websiteId)
  }

  async createCategory(actor: ActorContext, input: TourCategoryCreateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const category = await this.repository.createCategory(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'tour_category.created',
      entityType: 'tour_category',
      entityId: category.id,
      requestId,
    })
    return category
  }

  async updateCategory(actor: ActorContext, id: string, input: TourCategoryUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('TourCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const category = await this.repository.updateCategory(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'tour_category.updated',
      entityType: 'tour_category',
      entityId: id,
      requestId,
    })
    return category
  }

  /** Hard delete (no soft delete/recycle bin, matching news_categories). `on delete restrict` on tour_page_categories.category_id blocks this if any tour still uses it. */
  async deleteCategory(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('TourCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteCategory(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'tour_category.deleted',
      entityType: 'tour_category',
      entityId: id,
      requestId,
    })
  }

  async assignTourCategories(actor: ActorContext, pageId: string, categoryIds: string[], websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    await this.checkWebsiteAccess(actor, websiteId)
    await this.repository.replaceTourCategories(pageId, categoryIds)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'tour_page_categories.assigned',
      entityType: 'cms_page',
      entityId: pageId,
      requestId,
    })
  }

  async getTourCategoryIds(pageId: string) {
    return this.repository.listTourCategoryIds(pageId)
  }
}
