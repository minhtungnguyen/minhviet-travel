/**
 * Domain types for database/migrations/0016_attraction_ticket_module.sql —
 * the "Vé vui chơi" (Attraction Ticket) module. First real Booking/Order
 * domain in this schema (docs/mv-ticket/00-current-state-audit.md §2).
 *
 * Deliberately does NOT import anything from `modules/master-data` —
 * `attraction_venues.destinationId` is a raw FK id here; a caller that
 * needs the destination's translated name calls `MasterDataService`
 * itself (module-boundaries.md: a module's repository never queries
 * another module's table directly; cross-module reads go through the
 * owning module's service, composed by the caller, not baked in here).
 */

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type AttractionOrderStatus =
  | 'INITIATED'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'VOUCHER_ISSUED'

export type AttractionVenue = {
  id: string
  websiteId: string
  destinationId: string
  slug: string
  imageUrl: string
  imageAlt: string
  isFeatured: boolean
  sortOrder: number
  status: EntityStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type AttractionVenueTranslation = {
  id: string
  attractionVenueId: string
  locale: string
  name: string
  summary: string | null
  description: string | null
  usageGuide: string | null
  policy: string | null
  highlights: string[]
}

export type AttractionGalleryImage = {
  url: string
  alt: string
  sortOrder: number
}

export type AttractionProduct = {
  id: string
  websiteId: string
  attractionVenueId: string
  productTypeId: string
  slug: string
  imageUrl: string
  imageAlt: string
  galleryImages: AttractionGalleryImage[]
  priceFrom: number | null
  currency: 'VND'
  isFeatured: boolean
  sortOrder: number
  status: EntityStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type AttractionProductTranslation = {
  id: string
  attractionProductId: string
  locale: string
  title: string
  summary: string | null
  description: string | null
  cancellationPolicy: string | null
  metaTitle: string | null
  metaDescription: string | null
}

/** "Dữ liệu B" — provider id mapping. Exactly one of venueId/productId is set (DB check constraint). */
export type AttractionProviderRef = {
  id: string
  attractionVenueId: string | null
  attractionProductId: string | null
  providerCode: string
  providerVenueId: string | null
  providerProductId: string | null
  providerVariantId: string | null
  lastSyncedAt: string | null
}

export type AttractionFaq = {
  id: string
  attractionProductId: string
  locale: string
  question: string
  answer: string
  sortOrder: number
}

export type AttractionCrossSell = {
  id: string
  attractionProductId: string
  relatedUrl: string
  label: string
  sortOrder: number
}

export type AttractionOrder = {
  id: string
  websiteId: string
  orderCode: string
  idempotencyKey: string
  providerCode: string
  providerOrderId: string | null
  status: AttractionOrderStatus
  paymentStatus: string | null
  customerName: string
  customerPhone: string
  customerEmail: string
  note: string | null
  currency: 'VND'
  totalAmount: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export type AttractionOrderItem = {
  id: string
  attractionOrderId: string
  attractionProductId: string
  providerVariantId: string
  usageDate: string
  quantity: number
  unitPrice: number
  ticketHolderName: string | null
}

export type AttractionVoucher = {
  id: string
  attractionOrderId: string
  providerVoucherId: string
  downloadUrl: string | null
  hashCode: string | null
  issuedAt: string | null
}

export type AttractionSyncLog = {
  id: string
  syncType: 'VENUE' | 'PRODUCT' | 'AVAILABILITY' | 'MANUAL'
  status: 'SUCCESS' | 'FAILED'
  attractionVenueId: string | null
  attractionProductId: string | null
  errorMessage: string | null
  triggeredBy: string | null
  createdAt: string
}

/**
 * Category taxonomy (database/migrations/0018_attraction_ticket_categories.sql,
 * D2 in docs/design/DESIGN-BIBLE-v1.0.md — separate table, not tag/jsonb).
 * Static reference data, no status/lifecycle field (03-database-design.md
 * reasoning: not editorial content with a publish workflow).
 */
export type AttractionCategory = {
  id: string
  websiteId: string
  slug: string
  iconKey: string
  sortOrder: number
}

export type AttractionCategoryTranslation = {
  id: string
  attractionCategoryId: string
  locale: string
  name: string
}

export type AttractionApiErrorLog = {
  id: string
  correlationId: string
  endpoint: string
  httpStatus: number | null
  errorCode: string | null
  errorMessage: string | null
  attractionOrderId: string | null
  createdAt: string
}
