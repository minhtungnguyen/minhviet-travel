/**
 * "Tour Availability As Logical Sales Signal" — a departure-level status
 * model for the Homepage tour card, replacing the old tour-level
 * `AvailabilityStatus` (`types/cms.ts`) for this surface only.
 *
 * `types/cms.ts`'s `AvailabilityStatus` ('open'|'limited'|'almost-full'|
 * 'closed'|'pending-confirmation') stays untouched — it's still load-bearing
 * for Tour Detail (`components/site/tour-detail/*`, `lib/tours/tour-detail-content.ts`,
 * `components/seo/json-ld.tsx`'s `TourDetailJsonLd`), which is out of
 * scope for this task. This file's `TourAvailabilityStatus` is a
 * deliberately separate, non-overlapping enum so neither surface's type
 * changes leak into the other.
 */
export type TourAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'CHECKING' | 'SOLD_OUT' | 'CLOSED'

/**
 * One bookable date for a tour. Status/seat data belongs here, not on
 * the tour itself — a tour can have departures in every status at once.
 * Any numeric/date field can be `null`: that is real, expected "we don't
 * have this data yet" state, not an error — see `deriveDepartureAvailability`,
 * which must fall back to CHECKING rather than guess.
 */
export interface TourDeparture {
  id: string
  tourId: string
  /** ISO date (yyyy-mm-dd or full ISO datetime) */
  departureDate: string
  departurePoint: string
  availabilityStatus: TourAvailabilityStatus | null
  capacity: number | null
  bookedSeats: number | null
  availableSeats: number | null
  saleOpenAt: string | null
  saleCloseAt: string | null
  price: number | null
  currency: 'VND'
  isActive: boolean
}

/** The resolved, display-ready availability for whichever departure was selected as primary. */
export interface DerivedAvailability {
  status: TourAvailabilityStatus
  label: string
  availableSeats: number | null
  isUrgent: boolean
}

export type AvailabilityCtaAction =
  | 'view-detail'
  | 'prefill-inquiry'
  | 'check-availability'
  | 'view-alternate-dates'
  | 'view-similar-tours'

export interface AvailabilityCta {
  label: string
  action: AvailabilityCtaAction
  href: string
}

/** What `JourneyCard` actually renders — always the output of `buildTourCardViewModel()`, never assembled ad hoc in a component. */
export interface TourCardViewModel<TTour = unknown> {
  tour: TTour
  primaryDeparture: TourDeparture | null
  availability: DerivedAvailability
  cta: AvailabilityCta
}

/** The seat-count threshold below which an AVAILABLE departure reads as LIMITED — a single named config, not a magic number inline. See `DEFAULT_AVAILABILITY_CONFIG`. */
export interface AvailabilityConfig {
  limitedSeatsThreshold: number
}
