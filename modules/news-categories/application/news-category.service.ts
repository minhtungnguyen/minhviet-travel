import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { NewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import type { NewsCategoryCreateInput, NewsCategoryUpdateInput } from '@/modules/news-categories/schemas/news-category.schema'

/**
 * News categories reuse `cms.page.update` (News is `cms_pages`, categories
 * are CMS content structure) — no dedicated permission, per the RBAC
 * discipline in docs/backend/admin-os/05-rbac-gap-report.md.
 */
export class NewsCategoryService {
  constructor(
    private readonly repository: NewsCategoryRepository,
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

  async createCategory(actor: ActorContext, input: NewsCategoryCreateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const category = await this.repository.createCategory(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'news_category.created',
      entityType: 'news_category',
      entityId: category.id,
      requestId,
    })
    return category
  }

  async updateCategory(actor: ActorContext, id: string, input: NewsCategoryUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('NewsCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const category = await this.repository.updateCategory(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'news_category.updated',
      entityType: 'news_category',
      entityId: id,
      requestId,
    })
    return category
  }

  /** Hard delete (Founder decision — no soft delete/recycle bin for V1). `on delete restrict` on news_article_categories.category_id blocks this if any article still uses it. */
  async deleteCategory(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('NewsCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteCategory(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'news_category.deleted',
      entityType: 'news_category',
      entityId: id,
      requestId,
    })
  }

  async assignArticleCategory(actor: ActorContext, pageId: string, categoryId: string, websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    await this.checkWebsiteAccess(actor, websiteId)
    await this.repository.assignArticleCategory(pageId, categoryId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'news_article_category.assigned',
      entityType: 'cms_page',
      entityId: pageId,
      requestId,
    })
  }

  async getArticleCategoryId(pageId: string) {
    return this.repository.findArticleCategoryId(pageId)
  }
}
