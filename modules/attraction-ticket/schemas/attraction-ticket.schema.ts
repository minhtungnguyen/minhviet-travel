import { z } from 'zod'
import { generalStatusSchema, localeSchema, slugSchema, uuidSchema } from '@/shared/validation/common'

// --- Venue -------------------------------------------------------------

export const attractionVenueCreateSchema = z
  .object({
    websiteId: uuidSchema,
    destinationId: uuidSchema,
    slug: slugSchema,
    imageUrl: z.string().min(1).max(500),
    imageAlt: z.string().min(1).max(300),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })
  .strict()

export const attractionVenueUpdateSchema = z
  .object({
    destinationId: uuidSchema.optional(),
    slug: slugSchema.optional(),
    imageUrl: z.string().min(1).max(500).optional(),
    imageAlt: z.string().min(1).max(300).optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: generalStatusSchema.optional(),
  })
  .strict()

export const attractionVenueTranslationUpsertSchema = z
  .object({
    locale: localeSchema,
    name: z.string().min(1).max(200),
    summary: z.string().max(500).optional(),
    description: z.string().max(5000).optional(),
    usageGuide: z.string().max(5000).optional(),
    policy: z.string().max(5000).optional(),
    highlights: z.array(z.string().min(1).max(200)).max(8).default([]),
  })
  .strict()

// --- Product -------------------------------------------------------------

const attractionGalleryImageSchema = z
  .object({
    url: z.string().min(1).max(500),
    alt: z.string().min(1).max(300),
    sortOrder: z.number().int().min(0).default(0),
  })
  .strict()

export const attractionProductCreateSchema = z
  .object({
    websiteId: uuidSchema,
    attractionVenueId: uuidSchema,
    productTypeId: uuidSchema,
    slug: slugSchema,
    imageUrl: z.string().min(1).max(500),
    imageAlt: z.string().min(1).max(300),
    galleryImages: z.array(attractionGalleryImageSchema).max(8).default([]),
    priceFrom: z.number().nonnegative().optional(),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })
  .strict()

export const attractionProductUpdateSchema = z
  .object({
    slug: slugSchema.optional(),
    imageUrl: z.string().min(1).max(500).optional(),
    imageAlt: z.string().min(1).max(300).optional(),
    galleryImages: z.array(attractionGalleryImageSchema).max(8).optional(),
    priceFrom: z.number().nonnegative().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: generalStatusSchema.optional(),
  })
  .strict()

export const attractionProductTranslationUpsertSchema = z
  .object({
    locale: localeSchema,
    title: z.string().min(1).max(300),
    summary: z.string().max(500).optional(),
    description: z.string().max(5000).optional(),
    cancellationPolicy: z.string().max(5000).optional(),
    metaTitle: z.string().max(160).optional(),
    metaDescription: z.string().max(320).optional(),
  })
  .strict()

// --- Booking / Checkout ---------------------------------------------------

export const attractionOrderItemInputSchema = z
  .object({
    attractionProductId: uuidSchema,
    providerVariantId: z.string().min(1),
    usageDate: z.string().date(),
    quantity: z.number().int().min(1).max(20),
    ticketHolderName: z.string().max(200).optional(),
  })
  .strict()

/**
 * Body for POST /attraction-tickets/bookings — `idempotencyKey` is
 * generated client-side once per checkout attempt and resent unchanged on
 * retry (docs/mv-ticket/02-system-architecture.md §4 "Idempotency"). Guest
 * checkout: no userId field — `createdBy` is resolved server-side from the
 * session if one exists, never trusted from the request body.
 *
 * `items` is exactly 1 for V1: the existing `AttractionTicketProvider`
 * contract's `createOrder(providerVariantId, quantity, date)` only accepts
 * one variant per call — `attraction_orders.provider_order_id` is a single
 * column, one provider order per Minh Việt order. A multi-line cart (e.g.
 * different ticket types in one checkout) needs either a per-item provider
 * order id or a richer provider `createOrder` call, both out of scope
 * until the contract is extended (docs/mv-ticket/02-system-architecture.md
 * §5, pending approval) — not attempted here to avoid an ambiguous
 * order-to-provider-order mapping. `quantity` on the single item already
 * covers "N of the same ticket type."
 */
export const attractionCheckoutCreateSchema = z
  .object({
    websiteId: uuidSchema,
    idempotencyKey: z.string().uuid(),
    items: z.array(attractionOrderItemInputSchema).length(1),
    customerName: z.string().min(1).max(200),
    customerPhone: z.string().min(6).max(30),
    customerEmail: z.string().email(),
    note: z.string().max(1000).optional(),
  })
  .strict()

export type AttractionVenueCreateInput = z.infer<typeof attractionVenueCreateSchema>
export type AttractionVenueUpdateInput = z.infer<typeof attractionVenueUpdateSchema>
export type AttractionVenueTranslationUpsertInput = z.infer<typeof attractionVenueTranslationUpsertSchema>
export type AttractionProductCreateInput = z.infer<typeof attractionProductCreateSchema>
export type AttractionProductUpdateInput = z.infer<typeof attractionProductUpdateSchema>
export type AttractionProductTranslationUpsertInput = z.infer<typeof attractionProductTranslationUpsertSchema>
export type AttractionOrderItemInput = z.infer<typeof attractionOrderItemInputSchema>
export type AttractionCheckoutCreateInput = z.infer<typeof attractionCheckoutCreateSchema>
