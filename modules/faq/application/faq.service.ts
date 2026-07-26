import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { FaqRepository } from '@/modules/faq/infrastructure/faq.repository'
import type {
  FaqCategoryCreateInput,
  FaqCategoryUpdateInput,
  FaqCreateInput,
  FaqUpdateInput,
} from '@/modules/faq/schemas/faq.schema'

export class FaqService {
  constructor(
    private readonly repository: FaqRepository,
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

  async createCategory(actor: ActorContext, input: FaqCategoryCreateInput, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const category = await this.repository.createCategory(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'faq_category.created',
      entityType: 'faq_category',
      entityId: category.id,
      requestId,
    })
    return category
  }

  async updateCategory(actor: ActorContext, id: string, input: FaqCategoryUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('FaqCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const category = await this.repository.updateCategory(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'faq_category.updated',
      entityType: 'faq_category',
      entityId: id,
      requestId,
    })
    return category
  }

  async deleteCategory(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    const existing = await this.repository.findCategoryById(id)
    if (!existing) throw AppError.notFound('FaqCategory', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteCategory(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'faq_category.deleted',
      entityType: 'faq_category',
      entityId: id,
      requestId,
    })
  }

  async listFaqs(faqCategoryId: string) {
    return this.repository.listFaqs(faqCategoryId)
  }

  async createFaq(actor: ActorContext, input: FaqCreateInput, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const category = await this.repository.findCategoryById(input.faqCategoryId)
    if (!category) throw AppError.notFound('FaqCategory', input.faqCategoryId)
    if (category.websiteId !== input.websiteId) {
      throw AppError.validation('faqCategoryId belongs to a different website')
    }
    const faq = await this.repository.createFaq(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'faq.created',
      entityType: 'faq',
      entityId: faq.id,
      requestId,
    })
    return faq
  }

  async updateFaq(actor: ActorContext, id: string, input: FaqUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    const existing = await this.repository.findFaqById(id)
    if (!existing) throw AppError.notFound('Faq', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const faq = await this.repository.updateFaq(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'faq.updated',
      entityType: 'faq',
      entityId: id,
      requestId,
    })
    return faq
  }

  async deleteFaq(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.faq.update')
    const existing = await this.repository.findFaqById(id)
    if (!existing) throw AppError.notFound('Faq', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteFaq(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'faq.deleted',
      entityType: 'faq',
      entityId: id,
      requestId,
    })
  }

  /** Public — active categories/FAQs for the given website + locale, per rls-policy-matrix.md. */
  async getPublicFaqs(websiteId: string, locale: string) {
    const categories = (await this.repository.listCategories(websiteId)).filter((c) => c.status === 'ACTIVE')
    const grouped = await Promise.all(
      categories.map(async (category) => {
        const faqs = (await this.repository.listFaqs(category.id)).filter(
          (f) => f.status === 'ACTIVE' && f.locale === locale,
        )
        return { category, faqs }
      }),
    )
    return grouped.filter((g) => g.faqs.length > 0)
  }
}
