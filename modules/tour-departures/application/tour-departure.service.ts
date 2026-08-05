import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { TourDepartureRepository } from '@/modules/tour-departures/infrastructure/tour-departure.repository'
import type { TourDepartureCreateInput, TourDepartureUpdateInput } from '@/modules/tour-departures/schemas/tour-departure.schema'

/**
 * Gated on `cms.page.publish`, one level stricter than the
 * `cms.page.update` categories/destinations/itinerary/policy use —
 * departure dates and pricing are what makes a tour bookable, matching
 * the RLS posture on `tour_departures` (database/policies/
 * 0011_tour_policies.sql).
 */
export class TourDepartureService {
  constructor(
    private readonly repository: TourDepartureRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listByPage(pageId: string) {
    return this.repository.listByPage(pageId)
  }

  async create(actor: ActorContext, input: TourDepartureCreateInput, websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.publish')
    await this.checkWebsiteAccess(actor, websiteId)
    const departure = await this.repository.create(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'tour_departure.created',
      entityType: 'tour_departure',
      entityId: departure.id,
      requestId,
    })
    return departure
  }

  async update(actor: ActorContext, id: string, input: TourDepartureUpdateInput, websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.publish')
    const existing = await this.repository.findById(id)
    if (!existing) throw AppError.notFound('TourDeparture', id)
    await this.checkWebsiteAccess(actor, websiteId)
    const departure = await this.repository.update(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'tour_departure.updated',
      entityType: 'tour_departure',
      entityId: id,
      requestId,
    })
    return departure
  }

  async delete(actor: ActorContext, id: string, websiteId: string, requestId: string) {
    requirePermission(actor, 'cms.page.publish')
    const existing = await this.repository.findById(id)
    if (!existing) throw AppError.notFound('TourDeparture', id)
    await this.checkWebsiteAccess(actor, websiteId)
    await this.repository.delete(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId,
      action: 'tour_departure.deleted',
      entityType: 'tour_departure',
      entityId: id,
      requestId,
    })
  }
}
