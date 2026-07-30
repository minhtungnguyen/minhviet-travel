import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { MediaRepository } from '@/modules/media/infrastructure/media.repository'
import type { MediaAssetCreateInput, MediaAssetUpdateInput, MediaFolderCreateInput } from '@/modules/media/schemas/media.schema'

export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccessIfScoped(actor: ActorContext, websiteId: string | undefined) {
    if (!websiteId) return // brand-wide asset — org membership already covers it
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listFolders(actor: ActorContext, websiteId?: string) {
    requirePermission(actor, 'media.asset.read')
    return this.repository.listFolders(websiteId)
  }

  async createFolder(actor: ActorContext, input: MediaFolderCreateInput, requestId: string) {
    requirePermission(actor, 'media.asset.upload')
    await this.checkWebsiteAccessIfScoped(actor, input.websiteId)
    const folder = await this.repository.createFolder(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'media_folder.created',
      entityType: 'media_folder',
      entityId: folder.id,
      requestId,
    })
    return folder
  }

  async listAssets(actor: ActorContext, websiteId: string | undefined, query: PaginationQuery, folderId?: string | null) {
    requirePermission(actor, 'media.asset.read')
    return this.repository.listAssets(websiteId, query, folderId)
  }

  async createAsset(actor: ActorContext, input: MediaAssetCreateInput, requestId: string) {
    requirePermission(actor, 'media.asset.upload')
    await this.checkWebsiteAccessIfScoped(actor, input.websiteId)
    const asset = await this.repository.createAsset(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'media_asset.created',
      entityType: 'media_asset',
      entityId: asset.id,
      requestId,
    })
    return asset
  }

  async getAsset(actor: ActorContext, id: string) {
    requirePermission(actor, 'media.asset.read')
    const asset = await this.repository.findAssetById(id)
    if (!asset) throw AppError.notFound('MediaAsset', id)
    return asset
  }

  async updateAsset(actor: ActorContext, id: string, input: MediaAssetUpdateInput, requestId: string) {
    requirePermission(actor, 'media.asset.upload')
    const existing = await this.repository.findAssetById(id)
    if (!existing) throw AppError.notFound('MediaAsset', id)
    await this.checkWebsiteAccessIfScoped(actor, existing.websiteId ?? undefined)
    const asset = await this.repository.updateAsset(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'media_asset.updated',
      entityType: 'media_asset',
      entityId: id,
      requestId,
    })
    return asset
  }

  async deleteAsset(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'media.asset.upload')
    const existing = await this.repository.findAssetById(id)
    if (!existing) throw AppError.notFound('MediaAsset', id)
    await this.checkWebsiteAccessIfScoped(actor, existing.websiteId ?? undefined)
    await this.repository.softDeleteAsset(id)
    // Deletion is explicitly listed as an audited action for media
    // (spec §18: "Media metadata deletion"), unlike create/update which
    // are audited too but not singled out — kept consistent here.
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'media_asset.deleted',
      entityType: 'media_asset',
      entityId: id,
      requestId,
    })
  }
}
