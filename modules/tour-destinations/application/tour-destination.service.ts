import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { TourDestinationRepository } from '@/modules/tour-destinations/infrastructure/tour-destination.repository'

/** Same RBAC discipline as tour-categories: reuses `cms.page.update`, no dedicated permission. */
export class TourDestinationService {
  constructor(
    private readonly repository: TourDestinationRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async assignTourDestinations(actor: ActorContext, pageId: string, destinationIds: string[], websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.update')
    await this.checkWebsiteAccess(actor, websiteId)
    await this.repository.replaceTourDestinations(pageId, destinationIds)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'tour_page_destinations.assigned',
      entityType: 'cms_page',
      entityId: pageId,
      requestId,
    })
  }

  async getTourDestinationIds(pageId: string) {
    return this.repository.listTourDestinationIds(pageId)
  }
}
