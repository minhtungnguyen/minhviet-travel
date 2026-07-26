import { z } from 'zod'

/**
 * Runtime validation for /ve-may-bay content, mirroring `lib/cms/schema.ts`'s
 * boundary rule: content is treated as untrusted input, not a trusted
 * internal constant, even while it's still sourced from a local seed file.
 */

const cmsImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
})

const flightAirportSchema = z.object({
  code: z.string().length(3),
  slug: z.string().min(1),
  city: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
})

const flightCabinClassSchema = z.enum(['economy', 'premium_economy', 'business', 'first'])

const flightCabinClassOptionSchema = z.object({
  value: flightCabinClassSchema,
  label: z.string().min(1),
})

const flightFlashSaleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  originCode: z.string().length(3),
  destinationCode: z.string().length(3),
  priceFrom: z.number().nonnegative(),
  currency: z.literal('VND'),
  validUntil: z.string().min(1),
  image: cmsImageSchema,
  href: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

const flightPopularRouteSchema = z.object({
  id: z.string().min(1),
  origin: flightAirportSchema,
  destination: flightAirportSchema,
  priceFrom: z.number().nonnegative(),
  currency: z.literal('VND'),
  popularAirlines: z.array(z.string().min(1)).min(1),
  href: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

const flightAirlineSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(2).max(3),
  name: z.string().min(1),
  shortName: z.string().min(1),
  isInternational: z.boolean(),
  order: z.number(),
  isActive: z.boolean(),
})

const flightArticleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  image: cmsImageSchema,
  publishedAt: z.string().min(1),
  href: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

const flightFaqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

export const flightHomeContentSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonicalPath: z.string().min(1),
    ogImage: z.string().min(1),
  }),
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    supportingCopy: z.string().min(1),
    image: cmsImageSchema,
  }),
  searchBox: z.object({
    airports: z.array(flightAirportSchema).min(2),
    cabinClasses: z.array(flightCabinClassOptionSchema).min(1),
    defaultOriginCode: z.string().length(3),
    defaultDestinationCode: z.string().length(3),
  }),
  flashSales: z.array(flightFlashSaleSchema).min(4).max(8),
  popularRoutes: z.array(flightPopularRouteSchema).min(1),
  airlines: z.array(flightAirlineSchema).min(1),
  articles: z.array(flightArticleSchema).min(1),
  faqs: z.array(flightFaqSchema).min(5).max(10),
  finalCta: z.object({
    headline: z.string().min(1),
    description: z.string().min(1),
    phone: z.string().min(1),
    primaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
    secondaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
  }),
})

/**
 * Flight Search Box submission — validated client-side (Search Results is
 * out of scope for this epic, so a valid submit only surfaces an inline
 * confirmation, see `flight-search-box.tsx`).
 */
export const flightSearchInputSchema = z
  .object({
    tripType: z.enum(['oneway', 'roundtrip']),
    originCode: z.string().length(3, 'Vui lòng chọn điểm đi'),
    destinationCode: z.string().length(3, 'Vui lòng chọn điểm đến'),
    departDate: z.string().min(1, 'Vui lòng chọn ngày đi'),
    returnDate: z.string().optional(),
    adults: z.number().int().min(1).max(9),
    children: z.number().int().min(0).max(8),
    infants: z.number().int().min(0).max(8),
    cabinClass: flightCabinClassSchema,
  })
  .refine((data) => data.originCode !== data.destinationCode, {
    message: 'Điểm đi và điểm đến không được trùng nhau',
    path: ['destinationCode'],
  })
  .refine((data) => data.tripType === 'oneway' || Boolean(data.returnDate), {
    message: 'Vui lòng chọn ngày về',
    path: ['returnDate'],
  })
  .refine(
    (data) => data.tripType === 'oneway' || !data.returnDate || data.returnDate >= data.departDate,
    { message: 'Ngày về phải sau ngày đi', path: ['returnDate'] },
  )
  .refine((data) => data.infants <= data.adults, {
    message: 'Số em bé không được nhiều hơn số người lớn',
    path: ['infants'],
  })

export type FlightSearchInput = z.infer<typeof flightSearchInputSchema>

/**
 * Search Results validation (EPIC-002). `flightSearchQuerySchema` re-parses
 * whatever `parseFlightSearchQueryParams` extracted from the URL — same
 * boundary rule as the homepage content: never trust a shape just because
 * it came from an internal helper.
 */
export const flightSearchQuerySchema = z
  .object({
    tripType: z.enum(['oneway', 'roundtrip']),
    originCode: z.string().length(3),
    destinationCode: z.string().length(3),
    departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày đi không hợp lệ'),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    adults: z.number().int().min(1).max(9),
    children: z.number().int().min(0).max(8),
    infants: z.number().int().min(0).max(8),
    cabinClass: flightCabinClassSchema,
  })
  .refine((data) => data.originCode !== data.destinationCode, {
    message: 'Điểm đi và điểm đến không được trùng nhau',
    path: ['destinationCode'],
  })

const flightBaggageAllowanceSchema = z.object({
  carryOnKg: z.number().positive(),
  checkedKg: z.number().positive(),
})

const flightOfferSchema = z.object({
  id: z.string().min(1),
  airlineCode: z.string().min(2).max(3),
  airlineName: z.string().min(1),
  flightNumber: z.string().min(1),
  originCode: z.string().length(3),
  destinationCode: z.string().length(3),
  departTime: z.string().min(1),
  arriveTime: z.string().min(1),
  durationMinutes: z.number().positive(),
  stops: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  stopAirportCodes: z.array(z.string()),
  cabinClass: flightCabinClassSchema,
  baggage: flightBaggageAllowanceSchema,
  price: z.number().nonnegative(),
  currency: z.literal('VND'),
  isRecommended: z.boolean(),
})

const fareCalendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priceFrom: z.number().nonnegative(),
  currency: z.literal('VND'),
  isCheapest: z.boolean(),
  isSelected: z.boolean(),
})

export const flightSearchResultsSchema = z.object({
  query: flightSearchQuerySchema,
  origin: flightAirportSchema,
  destination: flightAirportSchema,
  offers: z.array(flightOfferSchema),
  fareCalendar: z.array(fareCalendarDaySchema).length(7),
})
