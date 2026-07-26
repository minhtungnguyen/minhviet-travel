import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { SeoRepository } from '@/modules/seo/infrastructure/seo.repository'
import type { RedirectRuleCreateInput, RedirectRuleUpdateInput, SeoMetadataPutInput } from '@/modules/seo/schemas/seo.schema'

const MAX_REDIRECT_CHAIN_DEPTH = 20

export class SeoService {
  constructor(
    private readonly repository: SeoRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async getMetadata(websiteId: string, entityType: string, entityId: string, locale: string) {
    const metadata = await this.repository.findMetadata(websiteId, entityType, entityId, locale)
    if (!metadata) throw AppError.notFound('SeoMetadata', `${entityType}/${entityId}`)
    return metadata
  }

  async putMetadata(
    actor: ActorContext,
    entityType: string,
    entityId: string,
    input: SeoMetadataPutInput,
    requestId: string,
  ) {
    requirePermission(actor, 'seo.metadata.update')
    await this.checkWebsiteAccess(actor, input.websiteId)

    if (input.canonicalUrl) {
      const conflict = await this.repository.findMetadataByCanonicalUrl(input.websiteId, input.canonicalUrl)
      if (conflict && !(conflict.entityType === entityType && conflict.entityId === entityId)) {
        throw AppError.conflict(`Canonical URL "${input.canonicalUrl}" is already claimed by another entity on this website`)
      }
    }

    const existing = await this.repository.findMetadata(input.websiteId, entityType, entityId, input.locale)
    if (existing && existing.slug !== input.slug) {
      await this.repository.recordSlugHistory({
        websiteId: input.websiteId,
        entityType,
        entityId,
        oldLocale: input.locale,
        oldSlug: existing.slug,
        changedBy: actor.userId,
      })
    }

    const metadata = await this.repository.upsertMetadata(entityType, entityId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: existing ? 'seo.metadata.updated' : 'seo.metadata.created',
      entityType: 'seo_metadata',
      entityId: metadata.id,
      requestId,
    })
    return metadata
  }

  async listRedirects(websiteId: string) {
    return this.repository.listRedirects(websiteId)
  }

  /**
   * Rejects a self-redirect outright, and walks the destination chain
   * (only following hops that are themselves an existing source_path on
   * this website — an external destination simply ends the chain) up to
   * `MAX_REDIRECT_CHAIN_DEPTH` to catch multi-hop loops, not just direct
   * A->B->A cycles.
   */
  private async assertNoRedirectLoop(websiteId: string, sourcePath: string, destinationUrl: string, ignoreId?: string) {
    if (destinationUrl === sourcePath) {
      throw AppError.validation('A redirect cannot point to its own source path')
    }
    let currentDestination = destinationUrl
    for (let depth = 0; depth < MAX_REDIRECT_CHAIN_DEPTH; depth++) {
      const next = await this.repository.findRedirectBySourcePath(websiteId, currentDestination)
      if (!next || next.id === ignoreId) return
      if (next.destinationUrl === sourcePath) {
        throw AppError.validation('This redirect would create a loop with an existing redirect rule')
      }
      currentDestination = next.destinationUrl
    }
    throw AppError.validation('Redirect chain is too long — check for an unresolved loop')
  }

  async createRedirect(actor: ActorContext, input: RedirectRuleCreateInput, requestId: string) {
    requirePermission(actor, 'seo.redirect.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    await this.assertNoRedirectLoop(input.websiteId, input.sourcePath, input.destinationUrl)
    const existing = await this.repository.findRedirectBySourcePath(input.websiteId, input.sourcePath)
    if (existing) throw AppError.conflict(`A redirect for "${input.sourcePath}" already exists on this website`)
    const redirect = await this.repository.createRedirect(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'seo.redirect.created',
      entityType: 'redirect_rule',
      entityId: redirect.id,
      requestId,
    })
    return redirect
  }

  async updateRedirect(actor: ActorContext, id: string, input: RedirectRuleUpdateInput, requestId: string) {
    requirePermission(actor, 'seo.redirect.update')
    const existing = await this.repository.findRedirectById(id)
    if (!existing) throw AppError.notFound('RedirectRule', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const sourcePath = input.sourcePath ?? existing.sourcePath
    const destinationUrl = input.destinationUrl ?? existing.destinationUrl
    await this.assertNoRedirectLoop(existing.websiteId, sourcePath, destinationUrl, id)
    const redirect = await this.repository.updateRedirect(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'seo.redirect.updated',
      entityType: 'redirect_rule',
      entityId: id,
      requestId,
    })
    return redirect
  }

  async deleteRedirect(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'seo.redirect.update')
    const existing = await this.repository.findRedirectById(id)
    if (!existing) throw AppError.notFound('RedirectRule', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteRedirect(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'seo.redirect.deleted',
      entityType: 'redirect_rule',
      entityId: id,
      requestId,
    })
  }
}
