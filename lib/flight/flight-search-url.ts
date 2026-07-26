import type { FlightCabinClass, FlightSearchQuery, FlightTripType } from '@/types/flight'

/**
 * Single place that knows the Search Results URL shape —
 * `/ve-may-bay/tim-kiem?from=..&to=..&departureDate=..&...` (EPIC-002,
 * post-handover Architecture Update: see
 * docs/Handover/Flight/EPIC-002-HANDOVER.md). `/ve-may-bay/{from}/{to}`
 * (path-segment slugs) is reserved for the future SEO Landing Engine
 * (EPIC-008) and must never be reused for search — only `slug` fields on
 * `FlightAirport` still exist for that route to use later.
 *
 * `FlightSearchBox` (navigate on submit), `flight-data-seed.ts` (Flash
 * Sale / Popular Route CTAs), `flight-search-results.tsx` (Fare Calendar
 * re-search) and `app/ve-may-bay/tim-kiem/page.tsx` (parsing back) all go
 * through this instead of building query strings inline.
 */

/** How far out Flash Sale / Popular Route CTAs default the search date when the mock content itself doesn't carry one. */
export const DEFAULT_FLASH_SALE_SEARCH_OFFSET_DAYS = 14

/** Fallback route when `from`/`to`/`departureDate` are missing or malformed — mirrors the Homepage Search Box's own defaults. */
export const DEFAULT_ORIGIN_CODE = 'HPH'
export const DEFAULT_DESTINATION_CODE = 'SGN'

export const FLIGHT_SEARCH_PATH = '/ve-may-bay/tim-kiem'

const QUERY_KEYS = {
  from: 'from',
  to: 'to',
  tripType: 'tripType',
  departDate: 'departureDate',
  returnDate: 'returnDate',
  adults: 'adults',
  children: 'children',
  infants: 'infants',
  cabinClass: 'cabinClass',
} as const

export function buildFlightSearchQueryString(query: FlightSearchQuery): string {
  const params = new URLSearchParams()
  params.set(QUERY_KEYS.from, query.originCode)
  params.set(QUERY_KEYS.to, query.destinationCode)
  params.set(QUERY_KEYS.tripType, query.tripType)
  params.set(QUERY_KEYS.departDate, query.departDate)
  if (query.tripType === 'roundtrip' && query.returnDate) {
    params.set(QUERY_KEYS.returnDate, query.returnDate)
  }
  params.set(QUERY_KEYS.adults, String(query.adults))
  params.set(QUERY_KEYS.children, String(query.children))
  params.set(QUERY_KEYS.infants, String(query.infants))
  params.set(QUERY_KEYS.cabinClass, query.cabinClass)
  return params.toString()
}

export function buildFlightSearchUrl(query: FlightSearchQuery): string {
  return `${FLIGHT_SEARCH_PATH}?${buildFlightSearchQueryString(query)}`
}

const CABIN_CLASSES: FlightCabinClass[] = ['economy', 'premium_economy', 'business', 'first']
const AIRPORT_CODE_PATTERN = /^[A-Za-z]{3}$/

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

function parseCount(value: string | undefined, fallback: number, max: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

function parseAirportCode(value: string | undefined, fallback: string): string {
  return value && AIRPORT_CODE_PATTERN.test(value) ? value.toUpperCase() : fallback
}

/**
 * Defensive parse of the raw `searchParams` Next.js hands to
 * `/ve-may-bay/tim-kiem` — always returns a usable, fully-shaped
 * `FlightSearchQuery` (falling back to sane defaults for missing/garbled
 * values) rather than throwing, since the URL is user-editable.
 * `flight-search-repository.ts` still re-validates the result with
 * `flightSearchQuerySchema` — including the "origin !== destination"
 * business rule this function does not enforce on its own — before
 * generating mock offers.
 */
export function parseFlightSearchQueryParams(
  searchParams: Record<string, string | string[] | undefined>,
): FlightSearchQuery {
  const tripTypeRaw = readParam(searchParams, QUERY_KEYS.tripType)
  const tripType: FlightTripType = tripTypeRaw === 'roundtrip' ? 'roundtrip' : 'oneway'

  const departDateRaw = readParam(searchParams, QUERY_KEYS.departDate)
  const departDate = departDateRaw && /^\d{4}-\d{2}-\d{2}$/.test(departDateRaw) ? departDateRaw : todayIso()

  const returnDateRaw = readParam(searchParams, QUERY_KEYS.returnDate)
  const returnDate =
    tripType === 'roundtrip' && returnDateRaw && /^\d{4}-\d{2}-\d{2}$/.test(returnDateRaw) ? returnDateRaw : undefined

  const cabinClassRaw = readParam(searchParams, QUERY_KEYS.cabinClass)
  const cabinClass = CABIN_CLASSES.includes(cabinClassRaw as FlightCabinClass)
    ? (cabinClassRaw as FlightCabinClass)
    : 'economy'

  const originCode = parseAirportCode(readParam(searchParams, QUERY_KEYS.from), DEFAULT_ORIGIN_CODE)
  let destinationCode = parseAirportCode(readParam(searchParams, QUERY_KEYS.to), DEFAULT_DESTINATION_CODE)
  if (destinationCode === originCode) {
    destinationCode = originCode === DEFAULT_DESTINATION_CODE ? DEFAULT_ORIGIN_CODE : DEFAULT_DESTINATION_CODE
  }

  return {
    tripType,
    originCode,
    destinationCode,
    departDate,
    returnDate,
    adults: Math.max(1, parseCount(readParam(searchParams, QUERY_KEYS.adults), 1, 9)),
    children: parseCount(readParam(searchParams, QUERY_KEYS.children), 0, 8),
    infants: parseCount(readParam(searchParams, QUERY_KEYS.infants), 0, 8),
    cabinClass,
  }
}
