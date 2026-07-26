import type { CmsImage } from '@/types/cms'

/**
 * CMS-ready content contract for /ve-may-bay (EPIC-001 – Flight Homepage).
 * Mirrors the shape of `types/mice.ts` / `types/homepage.ts`: the mock
 * repository in `lib/flight/flight-data-seed.ts` is the only thing a real
 * flight-content CMS (or, eventually, a live airfare API per
 * `integrations/flight/contracts/flight-provider.ts`) needs to replace —
 * every section component depends only on `FlightHomeContent`.
 */

export type FlightTripType = 'oneway' | 'roundtrip'

export type FlightCabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export interface FlightCabinClassOption {
  value: FlightCabinClass
  label: string
}

/** One searchable airport/city in the Flight Search Box's origin/destination lists. */
export interface FlightAirport {
  code: string
  city: string
  name: string
  country: string
}

/** One promotional fare shown in the Flash Sale section. */
export interface FlightFlashSale {
  id: string
  slug: string
  title: string
  originCode: string
  destinationCode: string
  priceFrom: number
  currency: 'VND'
  /** ISO date the promotional fare stops being bookable. */
  validUntil: string
  image: CmsImage
  href: string
  order: number
  isActive: boolean
}

/** One frequently-searched route shown in the Popular Routes section. */
export interface FlightPopularRoute {
  id: string
  origin: FlightAirport
  destination: FlightAirport
  priceFrom: number
  currency: 'VND'
  popularAirlines: string[]
  href: string
  order: number
  isActive: boolean
}

/** One airline shown in the Airlines section. */
export interface FlightAirline {
  id: string
  code: string
  name: string
  shortName: string
  isInternational: boolean
  order: number
  isActive: boolean
}

/** One Travel Guide article teaser. */
export interface FlightArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  image: CmsImage
  publishedAt: string
  href: string
  order: number
  isActive: boolean
}

export interface FlightFaq {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

export interface FlightHomeContent {
  seo: {
    title: string
    description: string
    canonicalPath: string
    ogImage: string
  }
  hero: {
    eyebrow: string
    headline: string
    supportingCopy: string
    image: CmsImage
  }
  searchBox: {
    airports: FlightAirport[]
    cabinClasses: FlightCabinClassOption[]
    defaultOriginCode: string
    defaultDestinationCode: string
  }
  flashSales: FlightFlashSale[]
  popularRoutes: FlightPopularRoute[]
  airlines: FlightAirline[]
  articles: FlightArticle[]
  faqs: FlightFaq[]
  finalCta: {
    headline: string
    description: string
    phone: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
}
