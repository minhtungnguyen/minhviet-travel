import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { AttractionTicketRepository } from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import type { EntityStatus } from '@/modules/attraction-ticket/domain/types'
import type { AttractionTicketProvider } from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'
import type {
  AttractionProductCreateInput,
  AttractionProductTranslationUpsertInput,
  AttractionProductUpdateInput,
  AttractionVenueCreateInput,
  AttractionVenueTranslationUpsertInput,
  AttractionVenueUpdateInput,
} from '@/modules/attraction-ticket/schemas/attraction-ticket.schema'

/**
 * Read-side + content-authoring for venues/products. Deliberately does NOT
 * compose `MasterDataService` to enrich `destinationId` into a translated
 * destination name — that's the caller's job (module-boundaries.md: a
 * module calls another module's *service*, never its repository; this
 * service stays self-contained and returns raw `destinationId`, letting
 * the route/UI layer call `MasterDataService.getDestination()` itself when
 * it needs the display name — no cross-module wiring forced here before
 * it's actually needed).
 *
 * Public reads (landing/listing/detail pages) intentionally take no
 * `ActorContext` — they only ever return `status: 'ACTIVE'` rows, matching
 * the RLS posture in database/policies/0004_attraction_ticket_policies.sql.
 * Mutations require `attraction_ticket.venue.write` /
 * `attraction_ticket.product.write` / `attraction_ticket.content.publish`.
 */
export class AttractionCatalogService {
  constructor(
    private readonly repository: AttractionTicketRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
    /**
     * Only used for read-only variant discovery (`listProductVariantOptions`)
     * — dynamic ticket-type/price data always comes live from the provider,
     * never cached in Minh Việt's DB (docs/mv-ticket/02-system-architecture.md
     * §6 hybrid data strategy). Booking/sync mutations stay on
     * `AttractionBookingService`/`AttractionSyncService` — this dependency
     * exists only so a product detail page can show ticket-type options
     * without needing a separate, staff-gated sync call.
     */
    private readonly provider: AttractionTicketProvider,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  // --- Venues --------------------------------------------------------

  listPublishedVenues(websiteId: string) {
    return this.repository.listVenues(websiteId, 'ACTIVE')
  }

  async getPublishedVenueBySlug(websiteId: string, slug: string) {
    const venue = await this.repository.findVenueBySlug(websiteId, slug)
    if (!venue || venue.status !== 'ACTIVE') throw AppError.notFound('AttractionVenue', slug)
    const translations = await this.repository.listVenueTranslations(venue.id)
    return { venue, translations }
  }

  async getPublishedVenueById(id: string) {
    const venue = await this.repository.findVenueById(id)
    if (!venue || venue.status !== 'ACTIVE') throw AppError.notFound('AttractionVenue', id)
    const translations = await this.repository.listVenueTranslations(venue.id)
    return { venue, translations }
  }

  /**
   * Ticket-type options for a product's booking panel — read-only, no
   * audit log, no permission required (same public posture as every other
   * catalog read). Returns `[]` if the product has never been synced with
   * a provider (`attraction_provider_refs` has no row yet) rather than
   * throwing, so a not-yet-synced product's detail page still renders
   * (with an honest "chưa có loại vé khả dụng" state), never a 500.
   */
  async listProductVariantOptions(productId: string) {
    const ref = await this.repository.findProviderRefByProduct(productId)
    if (!ref?.providerProductId) return []
    return this.provider.syncVariants(ref.providerProductId)
  }

  async listVenues(actor: ActorContext, websiteId: string, status?: EntityStatus) {
    requirePermission(actor, 'attraction_ticket.venue.write')
    return this.repository.listVenues(websiteId, status)
  }

  async createVenue(actor: ActorContext, input: AttractionVenueCreateInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.venue.write')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const existing = await this.repository.findVenueBySlug(input.websiteId, input.slug)
    if (existing) throw AppError.conflict(`Slug "${input.slug}" is already used on this website`)
    const venue = await this.repository.createVenue(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: venue.websiteId,
      action: 'attraction_ticket.venue.created',
      entityType: 'attraction_venue',
      entityId: venue.id,
      requestId,
    })
    return venue
  }

  async updateVenue(actor: ActorContext, id: string, input: AttractionVenueUpdateInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.venue.write')
    const existing = await this.repository.findVenueById(id)
    if (!existing) throw AppError.notFound('AttractionVenue', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const venue = await this.repository.updateVenue(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'attraction_ticket.venue.updated',
      entityType: 'attraction_venue',
      entityId: id,
      requestId,
    })
    return venue
  }

  async upsertVenueTranslation(actor: ActorContext, venueId: string, input: AttractionVenueTranslationUpsertInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.venue.write')
    const existing = await this.repository.findVenueById(venueId)
    if (!existing) throw AppError.notFound('AttractionVenue', venueId)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const translation = await this.repository.upsertVenueTranslation(venueId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'attraction_ticket.venue_translation.upserted',
      entityType: 'attraction_venue_translation',
      entityId: translation.id,
      requestId,
    })
    return translation
  }

  // --- Products --------------------------------------------------------

  listPublishedProducts(websiteId: string, attractionVenueId?: string) {
    return this.repository.listProducts(websiteId, { attractionVenueId, status: 'ACTIVE' })
  }

  /**
   * Listing/landing pages need product + venue display names in one pass —
   * 4 queries total regardless of product count (products, all venues for
   * the website, bulk product translations, bulk venue translations),
   * never N+1 (brief §XIII). Still returns raw domain shapes, not a UI
   * view model — the page composes the final card props, together with
   * destination names from `MasterDataService` (kept out of this module,
   * per the file-level note above).
   */
  async listPublishedCatalog(websiteId: string, attractionVenueId?: string) {
    const products = await this.repository.listProducts(websiteId, { attractionVenueId, status: 'ACTIVE' })
    const venues = await this.repository.listVenues(websiteId, 'ACTIVE')
    const productIds = products.map((p) => p.id)
    const venueIds = venues.map((v) => v.id)
    const [productTranslations, venueTranslations] = await Promise.all([
      this.repository.listProductTranslationsForProducts(productIds),
      this.repository.listVenueTranslationsForVenues(venueIds),
    ])
    return { products, venues, productTranslations, venueTranslations }
  }

  // --- Categories --------------------------------------------------------

  /**
   * Public taxonomy read for Homepage category chips/rails — static
   * reference data, no ACTIVE-status filter (attraction_categories has no
   * lifecycle column, see domain/types.ts). Joins translations itself
   * (small, bounded list — 6 rows in V1 — unlike listPublishedCatalog this
   * doesn't need the bulk-query N+1 guard treatment for a list this size).
   */
  async listCategories(websiteId: string, locale: string) {
    const categories = await this.repository.listCategories(websiteId)
    const translations = await this.repository.listCategoryTranslationsForCategories(categories.map((c) => c.id))
    const translationByCategoryId = new Map(translations.filter((t) => t.locale === locale).map((t) => [t.attractionCategoryId, t]))
    return categories
      .map((category) => ({ category, name: translationByCategoryId.get(category.id)?.name ?? null }))
      .filter((entry): entry is { category: typeof entry.category; name: string } => entry.name !== null)
  }

  listProductIdsForCategory(categoryId: string) {
    return this.repository.listProductIdsForCategory(categoryId)
  }

  listCategoryLinksForProducts(productIds: string[]) {
    return this.repository.listCategoryLinksForProducts(productIds)
  }

  async getPublishedProductBySlug(websiteId: string, slug: string) {
    const product = await this.repository.findProductBySlug(websiteId, slug)
    if (!product || product.status !== 'ACTIVE') throw AppError.notFound('AttractionProduct', slug)
    const [translations, faqs, crossSells] = await Promise.all([
      this.repository.listProductTranslations(product.id),
      this.repository.listFaqs(product.id),
      this.repository.listCrossSells(product.id),
    ])
    return { product, translations, faqs, crossSells }
  }

  async createProduct(actor: ActorContext, input: AttractionProductCreateInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.product.write')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const venue = await this.repository.findVenueById(input.attractionVenueId)
    if (!venue) throw AppError.validation(`Attraction venue ${input.attractionVenueId} does not exist`)
    const existing = await this.repository.findProductBySlug(input.websiteId, input.slug)
    if (existing) throw AppError.conflict(`Slug "${input.slug}" is already used on this website`)
    const product = await this.repository.createProduct(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: product.websiteId,
      action: 'attraction_ticket.product.created',
      entityType: 'attraction_product',
      entityId: product.id,
      requestId,
    })
    return product
  }

  async updateProduct(actor: ActorContext, id: string, input: AttractionProductUpdateInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.product.write')
    const existing = await this.repository.findProductById(id)
    if (!existing) throw AppError.notFound('AttractionProduct', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const product = await this.repository.updateProduct(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'attraction_ticket.product.updated',
      entityType: 'attraction_product',
      entityId: id,
      requestId,
    })
    return product
  }

  async upsertProductTranslation(actor: ActorContext, productId: string, input: AttractionProductTranslationUpsertInput, requestId: string) {
    requirePermission(actor, 'attraction_ticket.product.write')
    const existing = await this.repository.findProductById(productId)
    if (!existing) throw AppError.notFound('AttractionProduct', productId)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const translation = await this.repository.upsertProductTranslation(productId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'attraction_ticket.product_translation.upserted',
      entityType: 'attraction_product_translation',
      entityId: translation.id,
      requestId,
    })
    return translation
  }
}
