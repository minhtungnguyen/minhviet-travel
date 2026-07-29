import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type {
  AttractionApiErrorLog,
  AttractionCategory,
  AttractionCategoryTranslation,
  AttractionCrossSell,
  AttractionFaq,
  AttractionOrder,
  AttractionOrderItem,
  AttractionOrderStatus,
  AttractionProduct,
  AttractionProductTranslation,
  AttractionProviderRef,
  AttractionSyncLog,
  AttractionVenue,
  AttractionVenueTranslation,
  AttractionVoucher,
  EntityStatus,
} from '@/modules/attraction-ticket/domain/types'
import type {
  AttractionProductCreateInput,
  AttractionProductTranslationUpsertInput,
  AttractionProductUpdateInput,
  AttractionVenueCreateInput,
  AttractionVenueTranslationUpsertInput,
  AttractionVenueUpdateInput,
} from '@/modules/attraction-ticket/schemas/attraction-ticket.schema'

/** Assembled by the application service (after computing price/availability via the provider), not parsed straight from the checkout Zod schema. */
export type AttractionOrderInsert = {
  websiteId: string
  orderCode: string
  idempotencyKey: string
  providerCode: string
  customerName: string
  customerPhone: string
  customerEmail: string
  note?: string | null
  totalAmount: number
  createdBy?: string | null
  requestSnapshot?: Record<string, unknown> | null
}

export type AttractionOrderItemInsert = {
  attractionProductId: string
  providerVariantId: string
  usageDate: string
  quantity: number
  unitPrice: number
  ticketHolderName?: string | null
}

export type AttractionOrderStatusPatch = {
  providerOrderId?: string | null
  paymentStatus?: string | null
  responseReference?: Record<string, unknown> | null
}

export type AttractionProviderRefUpsert = {
  providerCode: string
  providerVenueId?: string | null
  providerProductId?: string | null
  providerVariantId?: string | null
  rawSnapshot?: Record<string, unknown> | null
}

export interface AttractionTicketRepository {
  findVenueById(id: string): Promise<AttractionVenue | null>
  findVenueBySlug(websiteId: string, slug: string): Promise<AttractionVenue | null>
  listVenues(websiteId: string, status?: EntityStatus): Promise<AttractionVenue[]>
  createVenue(input: AttractionVenueCreateInput): Promise<AttractionVenue>
  updateVenue(id: string, input: AttractionVenueUpdateInput): Promise<AttractionVenue>
  softDeleteVenue(id: string): Promise<void>
  listVenueTranslations(venueId: string): Promise<AttractionVenueTranslation[]>
  /** Bulk variant of `listVenueTranslations` for listing pages — avoids N+1 (brief §XIII). */
  listVenueTranslationsForVenues(venueIds: string[]): Promise<AttractionVenueTranslation[]>
  upsertVenueTranslation(venueId: string, input: AttractionVenueTranslationUpsertInput): Promise<AttractionVenueTranslation>

  findProductById(id: string): Promise<AttractionProduct | null>
  findProductBySlug(websiteId: string, slug: string): Promise<AttractionProduct | null>
  listProducts(websiteId: string, filter?: { attractionVenueId?: string; status?: EntityStatus }): Promise<AttractionProduct[]>
  createProduct(input: AttractionProductCreateInput): Promise<AttractionProduct>
  updateProduct(id: string, input: AttractionProductUpdateInput): Promise<AttractionProduct>
  softDeleteProduct(id: string): Promise<void>
  listProductTranslations(productId: string): Promise<AttractionProductTranslation[]>
  /** Bulk variant of `listProductTranslations` for listing pages — avoids N+1 (brief §XIII). */
  listProductTranslationsForProducts(productIds: string[]): Promise<AttractionProductTranslation[]>
  upsertProductTranslation(productId: string, input: AttractionProductTranslationUpsertInput): Promise<AttractionProductTranslation>
  listFaqs(productId: string): Promise<AttractionFaq[]>
  listCrossSells(productId: string): Promise<AttractionCrossSell[]>

  /** Public taxonomy read — Homepage category chips (docs/design/mv-ticket/02-homepage-and-listing-concept.md §1.2). No status filter (static reference data). */
  listCategories(websiteId: string): Promise<AttractionCategory[]>
  listCategoryTranslationsForCategories(categoryIds: string[]): Promise<AttractionCategoryTranslation[]>
  /** Product ids tagged with a given category — used to filter/count product rails by category. */
  listProductIdsForCategory(categoryId: string): Promise<string[]>
  /** Reverse of the above, bulk — {productId, categoryId} pairs for a set of products, one query instead of N (brief §XIII). */
  listCategoryLinksForProducts(productIds: string[]): Promise<{ attractionProductId: string; attractionCategoryId: string }[]>

  findProviderRefByVenue(venueId: string): Promise<AttractionProviderRef | null>
  findProviderRefByProduct(productId: string): Promise<AttractionProviderRef | null>
  upsertProviderRefForVenue(venueId: string, input: AttractionProviderRefUpsert): Promise<AttractionProviderRef>
  upsertProviderRefForProduct(productId: string, input: AttractionProviderRefUpsert): Promise<AttractionProviderRef>

  findOrderById(id: string): Promise<AttractionOrder | null>
  findOrderByIdempotencyKey(idempotencyKey: string): Promise<AttractionOrder | null>
  /** Guest-facing lookup — gated by order_code + the email used at checkout, never a bare id (docs/mv-ticket/03-database-design.md §4). */
  findOrderByCodeForCustomer(orderCode: string, email: string): Promise<AttractionOrder | null>
  createOrder(order: AttractionOrderInsert, items: AttractionOrderItemInsert[]): Promise<{ order: AttractionOrder; items: AttractionOrderItem[] }>
  updateOrderStatus(id: string, status: AttractionOrderStatus, patch?: AttractionOrderStatusPatch): Promise<AttractionOrder>
  listOrderItems(orderId: string): Promise<AttractionOrderItem[]>
  createVoucher(orderId: string, voucher: { providerVoucherId: string; downloadUrl?: string | null; hashCode?: string | null; issuedAt?: string | null }): Promise<AttractionVoucher>
  listVouchers(orderId: string): Promise<AttractionVoucher[]>

  createSyncLog(input: {
    syncType: AttractionSyncLog['syncType']
    status: AttractionSyncLog['status']
    attractionVenueId?: string | null
    attractionProductId?: string | null
    errorMessage?: string | null
    triggeredBy?: string | null
  }): Promise<AttractionSyncLog>
  createApiErrorLog(input: {
    correlationId: string
    endpoint: string
    httpStatus?: number | null
    errorCode?: string | null
    errorMessage?: string | null
    attractionOrderId?: string | null
  }): Promise<AttractionApiErrorLog>
}

// --- row types + mappers (snake_case DB row -> camelCase domain type) -----

type VenueRow = {
  id: string
  website_id: string
  destination_id: string
  slug: string
  image_url: string
  image_alt: string
  is_featured: boolean
  sort_order: number
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}
const mapVenue = (r: VenueRow): AttractionVenue => ({
  id: r.id,
  websiteId: r.website_id,
  destinationId: r.destination_id,
  slug: r.slug,
  imageUrl: r.image_url,
  imageAlt: r.image_alt,
  isFeatured: r.is_featured,
  sortOrder: r.sort_order,
  status: r.status as EntityStatus,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
})

type VenueTranslationRow = {
  id: string
  attraction_venue_id: string
  locale: string
  name: string
  summary: string | null
  description: string | null
  usage_guide: string | null
  policy: string | null
  highlights: unknown
}
const mapVenueTranslation = (r: VenueTranslationRow): AttractionVenueTranslation => ({
  id: r.id,
  attractionVenueId: r.attraction_venue_id,
  locale: r.locale,
  name: r.name,
  summary: r.summary,
  description: r.description,
  usageGuide: r.usage_guide,
  policy: r.policy,
  highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
})

type ProductRow = {
  id: string
  website_id: string
  attraction_venue_id: string
  product_type_id: string
  slug: string
  image_url: string
  image_alt: string
  gallery_images: unknown
  price_from: number | null
  currency: string
  is_featured: boolean
  sort_order: number
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}
const mapProduct = (r: ProductRow): AttractionProduct => ({
  id: r.id,
  websiteId: r.website_id,
  attractionVenueId: r.attraction_venue_id,
  productTypeId: r.product_type_id,
  slug: r.slug,
  imageUrl: r.image_url,
  imageAlt: r.image_alt,
  galleryImages: Array.isArray(r.gallery_images) ? (r.gallery_images as AttractionProduct['galleryImages']) : [],
  priceFrom: r.price_from,
  currency: r.currency as 'VND',
  isFeatured: r.is_featured,
  sortOrder: r.sort_order,
  status: r.status as EntityStatus,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
})

type ProductTranslationRow = {
  id: string
  attraction_product_id: string
  locale: string
  title: string
  summary: string | null
  description: string | null
  cancellation_policy: string | null
  meta_title: string | null
  meta_description: string | null
}
const mapProductTranslation = (r: ProductTranslationRow): AttractionProductTranslation => ({
  id: r.id,
  attractionProductId: r.attraction_product_id,
  locale: r.locale,
  title: r.title,
  summary: r.summary,
  description: r.description,
  cancellationPolicy: r.cancellation_policy,
  metaTitle: r.meta_title,
  metaDescription: r.meta_description,
})

type FaqRow = { id: string; attraction_product_id: string; locale: string; question: string; answer: string; sort_order: number }
const mapFaq = (r: FaqRow): AttractionFaq => ({
  id: r.id,
  attractionProductId: r.attraction_product_id,
  locale: r.locale,
  question: r.question,
  answer: r.answer,
  sortOrder: r.sort_order,
})

type CrossSellRow = { id: string; attraction_product_id: string; related_url: string; label: string; sort_order: number }
const mapCrossSell = (r: CrossSellRow): AttractionCrossSell => ({
  id: r.id,
  attractionProductId: r.attraction_product_id,
  relatedUrl: r.related_url,
  label: r.label,
  sortOrder: r.sort_order,
})

type ProviderRefRow = {
  id: string
  attraction_venue_id: string | null
  attraction_product_id: string | null
  provider_code: string
  provider_venue_id: string | null
  provider_product_id: string | null
  provider_variant_id: string | null
  last_synced_at: string | null
}
const mapProviderRef = (r: ProviderRefRow): AttractionProviderRef => ({
  id: r.id,
  attractionVenueId: r.attraction_venue_id,
  attractionProductId: r.attraction_product_id,
  providerCode: r.provider_code,
  providerVenueId: r.provider_venue_id,
  providerProductId: r.provider_product_id,
  providerVariantId: r.provider_variant_id,
  lastSyncedAt: r.last_synced_at,
})

type OrderRow = {
  id: string
  website_id: string
  order_code: string
  idempotency_key: string
  provider_code: string
  provider_order_id: string | null
  status: string
  payment_status: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  note: string | null
  currency: string
  total_amount: number
  created_by: string | null
  created_at: string
  updated_at: string
}
const mapOrder = (r: OrderRow): AttractionOrder => ({
  id: r.id,
  websiteId: r.website_id,
  orderCode: r.order_code,
  idempotencyKey: r.idempotency_key,
  providerCode: r.provider_code,
  providerOrderId: r.provider_order_id,
  status: r.status as AttractionOrderStatus,
  paymentStatus: r.payment_status,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  customerEmail: r.customer_email,
  note: r.note,
  currency: r.currency as 'VND',
  totalAmount: r.total_amount,
  createdBy: r.created_by,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

type OrderItemRow = {
  id: string
  attraction_order_id: string
  attraction_product_id: string
  provider_variant_id: string
  usage_date: string
  quantity: number
  unit_price: number
  ticket_holder_name: string | null
}
const mapOrderItem = (r: OrderItemRow): AttractionOrderItem => ({
  id: r.id,
  attractionOrderId: r.attraction_order_id,
  attractionProductId: r.attraction_product_id,
  providerVariantId: r.provider_variant_id,
  usageDate: r.usage_date,
  quantity: r.quantity,
  unitPrice: r.unit_price,
  ticketHolderName: r.ticket_holder_name,
})

type VoucherRow = {
  id: string
  attraction_order_id: string
  provider_voucher_id: string
  download_url: string | null
  hash_code: string | null
  issued_at: string | null
}
const mapVoucher = (r: VoucherRow): AttractionVoucher => ({
  id: r.id,
  attractionOrderId: r.attraction_order_id,
  providerVoucherId: r.provider_voucher_id,
  downloadUrl: r.download_url,
  hashCode: r.hash_code,
  issuedAt: r.issued_at,
})

type SyncLogRow = {
  id: string
  sync_type: string
  status: string
  attraction_venue_id: string | null
  attraction_product_id: string | null
  error_message: string | null
  triggered_by: string | null
  created_at: string
}
const mapSyncLog = (r: SyncLogRow): AttractionSyncLog => ({
  id: r.id,
  syncType: r.sync_type as AttractionSyncLog['syncType'],
  status: r.status as AttractionSyncLog['status'],
  attractionVenueId: r.attraction_venue_id,
  attractionProductId: r.attraction_product_id,
  errorMessage: r.error_message,
  triggeredBy: r.triggered_by,
  createdAt: r.created_at,
})

type ApiErrorLogRow = {
  id: string
  correlation_id: string
  endpoint: string
  http_status: number | null
  error_code: string | null
  error_message: string | null
  attraction_order_id: string | null
  created_at: string
}
const mapApiErrorLog = (r: ApiErrorLogRow): AttractionApiErrorLog => ({
  id: r.id,
  correlationId: r.correlation_id,
  endpoint: r.endpoint,
  httpStatus: r.http_status,
  errorCode: r.error_code,
  errorMessage: r.error_message,
  attractionOrderId: r.attraction_order_id,
  createdAt: r.created_at,
})

type CategoryRow = { id: string; website_id: string; slug: string; icon_key: string; sort_order: number }
const mapCategory = (r: CategoryRow): AttractionCategory => ({
  id: r.id,
  websiteId: r.website_id,
  slug: r.slug,
  iconKey: r.icon_key,
  sortOrder: r.sort_order,
})

type CategoryTranslationRow = { id: string; attraction_category_id: string; locale: string; name: string }
const mapCategoryTranslation = (r: CategoryTranslationRow): AttractionCategoryTranslation => ({
  id: r.id,
  attractionCategoryId: r.attraction_category_id,
  locale: r.locale,
  name: r.name,
})

export class SupabaseAttractionTicketRepository implements AttractionTicketRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async findVenueById(id: string): Promise<AttractionVenue | null> {
    const { data, error } = await this.client.from('attraction_venues').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
    return data ? mapVenue(data) : null
  }

  async findVenueBySlug(websiteId: string, slug: string): Promise<AttractionVenue | null> {
    const { data, error } = await this.client
      .from('attraction_venues')
      .select('*')
      .eq('website_id', websiteId)
      .ilike('slug', slug)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
    return data ? mapVenue(data) : null
  }

  async listVenues(websiteId: string, status?: EntityStatus): Promise<AttractionVenue[]> {
    let builder = this.client.from('attraction_venues').select('*').eq('website_id', websiteId).is('deleted_at', null)
    if (status) builder = builder.eq('status', status)
    const { data, error } = await builder.order('sort_order')
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
    return (data ?? []).map(mapVenue)
  }

  async createVenue(input: AttractionVenueCreateInput): Promise<AttractionVenue> {
    const { data, error } = await this.client
      .from('attraction_venues')
      .insert({
        website_id: input.websiteId,
        destination_id: input.destinationId,
        slug: input.slug,
        image_url: input.imageUrl,
        image_alt: input.imageAlt,
        is_featured: input.isFeatured,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
    return mapVenue(data)
  }

  async updateVenue(id: string, input: AttractionVenueUpdateInput): Promise<AttractionVenue> {
    const { data, error } = await this.client
      .from('attraction_venues')
      .update({
        ...(input.destinationId !== undefined && { destination_id: input.destinationId }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
        ...(input.imageAlt !== undefined && { image_alt: input.imageAlt }),
        ...(input.isFeatured !== undefined && { is_featured: input.isFeatured }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
    return mapVenue(data)
  }

  async softDeleteVenue(id: string): Promise<void> {
    const { error } = await this.client.from('attraction_venues').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw mapDatabaseError(error, 'AttractionVenue')
  }

  async listVenueTranslations(venueId: string): Promise<AttractionVenueTranslation[]> {
    const { data, error } = await this.client.from('attraction_venue_translations').select('*').eq('attraction_venue_id', venueId)
    if (error) throw mapDatabaseError(error, 'AttractionVenueTranslation')
    return (data ?? []).map(mapVenueTranslation)
  }

  async listVenueTranslationsForVenues(venueIds: string[]): Promise<AttractionVenueTranslation[]> {
    if (venueIds.length === 0) return []
    const { data, error } = await this.client.from('attraction_venue_translations').select('*').in('attraction_venue_id', venueIds)
    if (error) throw mapDatabaseError(error, 'AttractionVenueTranslation')
    return (data ?? []).map(mapVenueTranslation)
  }

  async upsertVenueTranslation(venueId: string, input: AttractionVenueTranslationUpsertInput): Promise<AttractionVenueTranslation> {
    const { data, error } = await this.client
      .from('attraction_venue_translations')
      .upsert(
        {
          attraction_venue_id: venueId,
          locale: input.locale,
          name: input.name,
          summary: input.summary ?? null,
          description: input.description ?? null,
          usage_guide: input.usageGuide ?? null,
          policy: input.policy ?? null,
          highlights: input.highlights as never,
        },
        { onConflict: 'attraction_venue_id,locale' },
      )
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionVenueTranslation')
    return mapVenueTranslation(data)
  }

  async findProductById(id: string): Promise<AttractionProduct | null> {
    const { data, error } = await this.client.from('attraction_products').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
    return data ? mapProduct(data) : null
  }

  async findProductBySlug(websiteId: string, slug: string): Promise<AttractionProduct | null> {
    const { data, error } = await this.client
      .from('attraction_products')
      .select('*')
      .eq('website_id', websiteId)
      .ilike('slug', slug)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
    return data ? mapProduct(data) : null
  }

  async listProducts(websiteId: string, filter?: { attractionVenueId?: string; status?: EntityStatus }): Promise<AttractionProduct[]> {
    let builder = this.client.from('attraction_products').select('*').eq('website_id', websiteId).is('deleted_at', null)
    if (filter?.attractionVenueId) builder = builder.eq('attraction_venue_id', filter.attractionVenueId)
    if (filter?.status) builder = builder.eq('status', filter.status)
    const { data, error } = await builder.order('sort_order')
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
    return (data ?? []).map(mapProduct)
  }

  async createProduct(input: AttractionProductCreateInput): Promise<AttractionProduct> {
    const { data, error } = await this.client
      .from('attraction_products')
      .insert({
        website_id: input.websiteId,
        attraction_venue_id: input.attractionVenueId,
        product_type_id: input.productTypeId,
        slug: input.slug,
        image_url: input.imageUrl,
        image_alt: input.imageAlt,
        gallery_images: input.galleryImages,
        price_from: input.priceFrom ?? null,
        is_featured: input.isFeatured,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
    return mapProduct(data)
  }

  async updateProduct(id: string, input: AttractionProductUpdateInput): Promise<AttractionProduct> {
    const { data, error } = await this.client
      .from('attraction_products')
      .update({
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
        ...(input.imageAlt !== undefined && { image_alt: input.imageAlt }),
        ...(input.galleryImages !== undefined && { gallery_images: input.galleryImages }),
        ...(input.priceFrom !== undefined && { price_from: input.priceFrom }),
        ...(input.isFeatured !== undefined && { is_featured: input.isFeatured }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
    return mapProduct(data)
  }

  async softDeleteProduct(id: string): Promise<void> {
    const { error } = await this.client.from('attraction_products').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw mapDatabaseError(error, 'AttractionProduct')
  }

  async listProductTranslations(productId: string): Promise<AttractionProductTranslation[]> {
    const { data, error } = await this.client.from('attraction_product_translations').select('*').eq('attraction_product_id', productId)
    if (error) throw mapDatabaseError(error, 'AttractionProductTranslation')
    return (data ?? []).map(mapProductTranslation)
  }

  async listProductTranslationsForProducts(productIds: string[]): Promise<AttractionProductTranslation[]> {
    if (productIds.length === 0) return []
    const { data, error } = await this.client.from('attraction_product_translations').select('*').in('attraction_product_id', productIds)
    if (error) throw mapDatabaseError(error, 'AttractionProductTranslation')
    return (data ?? []).map(mapProductTranslation)
  }

  async upsertProductTranslation(productId: string, input: AttractionProductTranslationUpsertInput): Promise<AttractionProductTranslation> {
    const { data, error } = await this.client
      .from('attraction_product_translations')
      .upsert(
        {
          attraction_product_id: productId,
          locale: input.locale,
          title: input.title,
          summary: input.summary ?? null,
          description: input.description ?? null,
          cancellation_policy: input.cancellationPolicy ?? null,
          meta_title: input.metaTitle ?? null,
          meta_description: input.metaDescription ?? null,
        },
        { onConflict: 'attraction_product_id,locale' },
      )
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionProductTranslation')
    return mapProductTranslation(data)
  }

  async listFaqs(productId: string): Promise<AttractionFaq[]> {
    const { data, error } = await this.client.from('attraction_faqs').select('*').eq('attraction_product_id', productId).order('sort_order')
    if (error) throw mapDatabaseError(error, 'AttractionFaq')
    return (data ?? []).map(mapFaq)
  }

  async listCrossSells(productId: string): Promise<AttractionCrossSell[]> {
    const { data, error } = await this.client.from('attraction_cross_sells').select('*').eq('attraction_product_id', productId).order('sort_order')
    if (error) throw mapDatabaseError(error, 'AttractionCrossSell')
    return (data ?? []).map(mapCrossSell)
  }

  async listCategories(websiteId: string): Promise<AttractionCategory[]> {
    const { data, error } = await this.client.from('attraction_categories').select('*').eq('website_id', websiteId).order('sort_order')
    if (error) throw mapDatabaseError(error, 'AttractionCategory')
    return (data ?? []).map(mapCategory)
  }

  async listCategoryTranslationsForCategories(categoryIds: string[]): Promise<AttractionCategoryTranslation[]> {
    if (categoryIds.length === 0) return []
    const { data, error } = await this.client.from('attraction_category_translations').select('*').in('attraction_category_id', categoryIds)
    if (error) throw mapDatabaseError(error, 'AttractionCategoryTranslation')
    return (data ?? []).map(mapCategoryTranslation)
  }

  async listProductIdsForCategory(categoryId: string): Promise<string[]> {
    const { data, error } = await this.client.from('attraction_product_categories').select('attraction_product_id').eq('attraction_category_id', categoryId)
    if (error) throw mapDatabaseError(error, 'AttractionProductCategory')
    return (data ?? []).map((r: { attraction_product_id: string }) => r.attraction_product_id)
  }

  async listCategoryLinksForProducts(productIds: string[]): Promise<{ attractionProductId: string; attractionCategoryId: string }[]> {
    if (productIds.length === 0) return []
    const { data, error } = await this.client.from('attraction_product_categories').select('attraction_product_id, attraction_category_id').in('attraction_product_id', productIds)
    if (error) throw mapDatabaseError(error, 'AttractionProductCategory')
    return (data ?? []).map((r: { attraction_product_id: string; attraction_category_id: string }) => ({
      attractionProductId: r.attraction_product_id,
      attractionCategoryId: r.attraction_category_id,
    }))
  }

  async findProviderRefByVenue(venueId: string): Promise<AttractionProviderRef | null> {
    const { data, error } = await this.client.from('attraction_provider_refs').select('*').eq('attraction_venue_id', venueId).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionProviderRef')
    return data ? mapProviderRef(data) : null
  }

  async findProviderRefByProduct(productId: string): Promise<AttractionProviderRef | null> {
    const { data, error } = await this.client.from('attraction_provider_refs').select('*').eq('attraction_product_id', productId).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionProviderRef')
    return data ? mapProviderRef(data) : null
  }

  private async upsertProviderRef(
    scope: { attraction_venue_id: string | null; attraction_product_id: string | null },
    input: AttractionProviderRefUpsert,
  ): Promise<AttractionProviderRef> {
    const existing = scope.attraction_venue_id
      ? await this.findProviderRefByVenue(scope.attraction_venue_id)
      : await this.findProviderRefByProduct(scope.attraction_product_id as string)

    const payload = {
      ...scope,
      provider_code: input.providerCode,
      provider_venue_id: input.providerVenueId ?? null,
      provider_product_id: input.providerProductId ?? null,
      provider_variant_id: input.providerVariantId ?? null,
      raw_snapshot: (input.rawSnapshot ?? null) as never,
      last_synced_at: new Date().toISOString(),
    }

    const query = existing
      ? this.client.from('attraction_provider_refs').update(payload).eq('id', existing.id)
      : this.client.from('attraction_provider_refs').insert(payload)
    const { data, error } = await query.select('*').single()
    if (error) throw mapDatabaseError(error, 'AttractionProviderRef')
    return mapProviderRef(data)
  }

  upsertProviderRefForVenue(venueId: string, input: AttractionProviderRefUpsert): Promise<AttractionProviderRef> {
    return this.upsertProviderRef({ attraction_venue_id: venueId, attraction_product_id: null }, input)
  }

  upsertProviderRefForProduct(productId: string, input: AttractionProviderRefUpsert): Promise<AttractionProviderRef> {
    return this.upsertProviderRef({ attraction_venue_id: null, attraction_product_id: productId }, input)
  }

  async findOrderById(id: string): Promise<AttractionOrder | null> {
    const { data, error } = await this.client.from('attraction_orders').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionOrder')
    return data ? mapOrder(data) : null
  }

  async findOrderByIdempotencyKey(idempotencyKey: string): Promise<AttractionOrder | null> {
    const { data, error } = await this.client.from('attraction_orders').select('*').eq('idempotency_key', idempotencyKey).maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionOrder')
    return data ? mapOrder(data) : null
  }

  async findOrderByCodeForCustomer(orderCode: string, email: string): Promise<AttractionOrder | null> {
    const { data, error } = await this.client
      .from('attraction_orders')
      .select('*')
      .eq('order_code', orderCode)
      .ilike('customer_email', email)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'AttractionOrder')
    return data ? mapOrder(data) : null
  }

  async createOrder(
    order: AttractionOrderInsert,
    items: AttractionOrderItemInsert[],
  ): Promise<{ order: AttractionOrder; items: AttractionOrderItem[] }> {
    const { data: orderRow, error: orderError } = await this.client
      .from('attraction_orders')
      .insert({
        website_id: order.websiteId,
        order_code: order.orderCode,
        idempotency_key: order.idempotencyKey,
        provider_code: order.providerCode,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_email: order.customerEmail,
        note: order.note ?? null,
        total_amount: order.totalAmount,
        created_by: order.createdBy ?? null,
        request_snapshot: (order.requestSnapshot ?? null) as never,
      })
      .select('*')
      .single()
    if (orderError) throw mapDatabaseError(orderError, 'AttractionOrder')

    const { data: itemRows, error: itemsError } = await this.client
      .from('attraction_order_items')
      .insert(
        items.map((item) => ({
          attraction_order_id: orderRow.id,
          attraction_product_id: item.attractionProductId,
          provider_variant_id: item.providerVariantId,
          usage_date: item.usageDate,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          ticket_holder_name: item.ticketHolderName ?? null,
        })),
      )
      .select('*')
    if (itemsError) throw mapDatabaseError(itemsError, 'AttractionOrderItem')

    return { order: mapOrder(orderRow), items: (itemRows ?? []).map(mapOrderItem) }
  }

  async updateOrderStatus(id: string, status: AttractionOrderStatus, patch: AttractionOrderStatusPatch = {}): Promise<AttractionOrder> {
    const { data, error } = await this.client
      .from('attraction_orders')
      .update({
        status,
        ...(patch.providerOrderId !== undefined && { provider_order_id: patch.providerOrderId }),
        ...(patch.paymentStatus !== undefined && { payment_status: patch.paymentStatus }),
        ...(patch.responseReference !== undefined && { response_reference: patch.responseReference as never }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionOrder')
    return mapOrder(data)
  }

  async listOrderItems(orderId: string): Promise<AttractionOrderItem[]> {
    const { data, error } = await this.client.from('attraction_order_items').select('*').eq('attraction_order_id', orderId)
    if (error) throw mapDatabaseError(error, 'AttractionOrderItem')
    return (data ?? []).map(mapOrderItem)
  }

  async createVoucher(
    orderId: string,
    voucher: { providerVoucherId: string; downloadUrl?: string | null; hashCode?: string | null; issuedAt?: string | null },
  ): Promise<AttractionVoucher> {
    const { data, error } = await this.client
      .from('attraction_vouchers')
      .insert({
        attraction_order_id: orderId,
        provider_voucher_id: voucher.providerVoucherId,
        download_url: voucher.downloadUrl ?? null,
        hash_code: voucher.hashCode ?? null,
        issued_at: voucher.issuedAt ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionVoucher')
    return mapVoucher(data)
  }

  async listVouchers(orderId: string): Promise<AttractionVoucher[]> {
    const { data, error } = await this.client.from('attraction_vouchers').select('*').eq('attraction_order_id', orderId)
    if (error) throw mapDatabaseError(error, 'AttractionVoucher')
    return (data ?? []).map(mapVoucher)
  }

  async createSyncLog(input: {
    syncType: AttractionSyncLog['syncType']
    status: AttractionSyncLog['status']
    attractionVenueId?: string | null
    attractionProductId?: string | null
    errorMessage?: string | null
    triggeredBy?: string | null
  }): Promise<AttractionSyncLog> {
    const { data, error } = await this.client
      .from('attraction_sync_logs')
      .insert({
        sync_type: input.syncType,
        status: input.status,
        attraction_venue_id: input.attractionVenueId ?? null,
        attraction_product_id: input.attractionProductId ?? null,
        error_message: input.errorMessage ?? null,
        triggered_by: input.triggeredBy ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionSyncLog')
    return mapSyncLog(data)
  }

  async createApiErrorLog(input: {
    correlationId: string
    endpoint: string
    httpStatus?: number | null
    errorCode?: string | null
    errorMessage?: string | null
    attractionOrderId?: string | null
  }): Promise<AttractionApiErrorLog> {
    const { data, error } = await this.client
      .from('attraction_api_error_logs')
      .insert({
        correlation_id: input.correlationId,
        endpoint: input.endpoint,
        http_status: input.httpStatus ?? null,
        error_code: input.errorCode ?? null,
        error_message: input.errorMessage ?? null,
        attraction_order_id: input.attractionOrderId ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'AttractionApiErrorLog')
    return mapApiErrorLog(data)
  }
}
