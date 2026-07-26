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
  /**
   * URL-safe city slug, reserved for the future SEO Landing Engine route
   * (`/ve-may-bay/{originSlug}/{destinationSlug}`, EPIC-008). Search
   * Results (EPIC-002) uses `code` in query params instead — see
   * docs/Handover/Flight/EPIC-002-HANDOVER.md's Architecture Update.
   */
  slug: string
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

/**
 * Search Results content contracts (EPIC-002). Mirrors `FlightHomeContent`'s
 * shape rule: every Search Results component depends only on these types,
 * never on `lib/flight/flight-search-mock.ts` directly.
 */

export type FlightStopCount = 0 | 1 | 2

export interface FlightBaggageAllowance {
  carryOnKg: number
  checkedKg: number
}

/** One bookable fare in the Search Results flight list (EPIC-002 §3 Flight Card). */
export interface FlightOffer {
  id: string
  airlineCode: string
  airlineName: string
  flightNumber: string
  originCode: string
  destinationCode: string
  /** ISO datetime (departure date + local time). */
  departTime: string
  /** ISO datetime (departure date + local time; may roll to the next day). */
  arriveTime: string
  durationMinutes: number
  stops: FlightStopCount
  stopAirportCodes: string[]
  cabinClass: FlightCabinClass
  baggage: FlightBaggageAllowance
  /** Total fare for the whole party (all passengers), not per-passenger. */
  price: number
  currency: 'VND'
  isRecommended: boolean
}

/** One day in the ±3-day Fare Calendar strip (EPIC-002 §3). */
export interface FareCalendarDay {
  /** ISO date (YYYY-MM-DD). */
  date: string
  priceFrom: number
  currency: 'VND'
  isCheapest: boolean
  isSelected: boolean
}

export interface FlightSearchQuery {
  tripType: FlightTripType
  originCode: string
  destinationCode: string
  /** ISO date (YYYY-MM-DD). */
  departDate: string
  /** ISO date (YYYY-MM-DD), only meaningful when `tripType === 'roundtrip'`. */
  returnDate?: string
  adults: number
  children: number
  infants: number
  cabinClass: FlightCabinClass
}

export interface FlightSearchResults {
  query: FlightSearchQuery
  origin: FlightAirport
  destination: FlightAirport
  offers: FlightOffer[]
  fareCalendar: FareCalendarDay[]
}

/**
 * Flight Detail content contracts (EPIC-003, `/ve-may-bay/chi-tiet/[flightId]`).
 * `flightId` is the same id `FlightOffer.id` already carries — it encodes
 * origin/destination/departDate/index (see `lib/flight/flight-search-mock.ts`),
 * so `flight-detail-repository.ts` can regenerate the exact same offer
 * deterministically rather than needing persisted storage. Mirrors the
 * shape rule of `FlightSearchResults`: every Flight Detail component
 * depends only on these types, never on `lib/flight/flight-detail-mock.ts` directly.
 */

/** One leg of a (possibly multi-stop) flight. A direct flight has exactly one segment. */
export interface FlightSegment {
  originCode: string
  destinationCode: string
  departTime: string
  arriveTime: string
  durationMinutes: number
  airlineCode: string
  airlineName: string
  flightNumber: string
  aircraft: string
}

/** Layover between two segments — `layovers.length === segments.length - 1`. */
export interface FlightLayover {
  airportCode: string
  durationMinutes: number
}

export type FareOptionTier = 'economy_saver' | 'economy_standard' | 'economy_flex' | 'business'

/** One purchasable fare tier for a given physical flight (EPIC-003 §4.3 Fare Options). */
export interface FareOption {
  id: string
  tier: FareOptionTier
  name: string
  baseFare: number
  taxes: number
  serviceFee: number
  /** Per-passenger total (base + taxes + service fee), before multiplying by party size. */
  totalPrice: number
  currency: 'VND'
  baggage: FlightBaggageAllowance
  mealIncluded: boolean
  seatSelectionIncluded: boolean
  changePolicy: string
  refundPolicy: string
  /** `null` means changes/refunds are not allowed on this tier, not "free". */
  changeFee: number | null
  refundFee: number | null
  isRecommended: boolean
}

/** Flight-level policy text (EPIC-003 §4.5), distinct from each `FareOption`'s short change/refundPolicy label. */
export interface FlightFareRules {
  changeConditions: string
  refundConditions: string
  noShowPolicy: string
  holdDeadlineMinutes: number
  /** PRD §4.6's mandated mock-data disclaimer, carried as data so it's never accidentally omitted from the UI. */
  priceDisclaimer: string
}

/** Itemized price for the selected `FareOption`, scaled to the searched party size (EPIC-003 §4.6). */
export interface FlightPriceBreakdown {
  baseFarePerPax: number
  taxesPerPax: number
  airportFeePerPax: number
  serviceFeePerPax: number
  surchargePerPax: number
  totalPerPax: number
  totalForParty: number
  currency: 'VND'
  passengerCount: { adults: number; children: number; infants: number }
}

export interface FlightDetail {
  /** Same value as the originating `FlightOffer.id`. */
  id: string
  origin: FlightAirport
  destination: FlightAirport
  airlineCode: string
  airlineName: string
  flightNumber: string
  aircraft: string
  cabinClass: FlightCabinClass
  segments: FlightSegment[]
  layovers: FlightLayover[]
  durationMinutes: number
  stops: FlightStopCount
  fareOptions: FareOption[]
  fareRules: FlightFareRules
  /** The `FareOption.id` matching the price/cabin the user searched with — pre-selected on load. */
  defaultFareOptionId: string
  /** Search context this detail was generated for (drives `FlightPriceBreakdown` party-size scaling). */
  query: FlightSearchQuery
}

/**
 * Booking Flow contracts (EPIC-004, `/ve-may-bay/dat-ve/[flightId]`).
 * Pure form state — nothing here is generated by a seeded mock
 * generator like `FlightOffer`/`FlightDetail` are, since a booking
 * draft is whatever the visitor actually types in. No booking is
 * created or persisted in this epic (see PRD §3 "Không bao gồm").
 */

export type BookingPassengerType = 'adult' | 'child' | 'infant'
export type BookingGender = 'male' | 'female' | 'other'
export type BookingDocumentType = 'cccd' | 'passport'

export interface BookingContactInfo {
  fullName: string
  email: string
  phone: string
}

/** One passenger's details — one `BookingPassenger` per seat in `FlightSearchQuery.adults/children/infants`. */
export interface BookingPassenger {
  id: string
  type: BookingPassengerType
  fullName: string
  gender: BookingGender
  /** ISO date (YYYY-MM-DD). */
  dateOfBirth: string
  nationality: string
  documentType: BookingDocumentType
  documentNumber: string
}

export type BookingExtraServiceType = 'extra_baggage' | 'seat_selection' | 'travel_insurance'

/** One optional add-on offered on the Booking page (EPIC-004 §4 Extra Services) — a static catalog, not tied to a specific flight. */
export interface BookingExtraService {
  id: string
  type: BookingExtraServiceType
  name: string
  description: string
  /** Per-passenger price — scaled by `adults + children` like fare pricing (see `partySize()`). */
  price: number
  currency: 'VND'
}

/** Price Summary for the Booking page (EPIC-004 §4) — the selected `FareOption`'s breakdown plus whichever extras the visitor added. */
export interface FlightBookingPriceSummary {
  fareBreakdown: FlightPriceBreakdown
  selectedExtraServices: BookingExtraService[]
  extrasTotalForParty: number
  grandTotal: number
  currency: 'VND'
}

/**
 * Payment & Confirmation contracts (EPIC-005,
 * `/ve-may-bay/thanh-toan|thanh-cong|that-bai/[bookingId]`).
 *
 * There is deliberately no server-side "booking" persistence — a real
 * one needs a Booking domain (database, ownership, auth) this platform
 * doesn't have yet (see `docs/backend/sprint-1b2-implementation-report.md`
 * §A.10 "Flight Hub placeholder": Booking depends on Product Core +
 * Pricing, neither built). Passenger contact/document data is also not
 * something that belongs in a URL (never put personal data in query
 * strings/params). So `FlightBookingDraft` — everything EPIC-004's form
 * collected — is saved to the browser's `sessionStorage` keyed by
 * `bookingId` (see `lib/flight/flight-booking-draft.ts`) and read back
 * entirely client-side; the flight/fare details are re-derived from
 * `flightId`/`query` the same deterministic way every other page in this
 * module does, never persisted either.
 */

export type PaymentMethod = 'qr' | 'bank_transfer' | 'domestic_card' | 'international_card'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired'

/** Everything needed to resume a booking on the Payment pages — the sessionStorage record `bookingId` keys into. */
export interface FlightBookingDraft {
  bookingId: string
  flightId: string
  fareOptionId: string
  query: FlightSearchQuery
  contact: BookingContactInfo
  passengers: BookingPassenger[]
  selectedExtraServiceIds: string[]
  /** ISO datetime — when the draft was created, used to derive whether the mock payment window has expired. */
  createdAt: string
}
