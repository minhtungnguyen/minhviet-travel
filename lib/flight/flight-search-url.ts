import type { FlightCabinClass, FlightTripType } from '@/types/flight'

/**
 * Single place that knows the Search Results URL shape
 * (`/ve-may-bay/{originSlug}/{destinationSlug}?ngayDi=...`, EPIC-002 §6) —
 * `FlightSearchBox` (navigate on submit), `flight-data-seed.ts` (Flash
 * Sale / Popular Route CTAs) and `app/ve-may-bay/[from]/[to]/page.tsx`
 * (parsing back) all go through this instead of building query strings
 * inline, so the URL contract only has one place to change.
 */

/** How far out Flash Sale / Popular Route CTAs default the search date when the mock content itself doesn't carry one. */
export const DEFAULT_FLASH_SALE_SEARCH_OFFSET_DAYS = 14

const QUERY_KEYS = {
  tripType: 'loai',
  departDate: 'ngayDi',
  returnDate: 'ngayVe',
  adults: 'nguoiLon',
  children: 'treEm',
  infants: 'emBe',
  cabinClass: 'hang',
} as const

export interface FlightSearchUrlQuery {
  tripType: FlightTripType
  departDate: string
  returnDate?: string
  adults: number
  children: number
  infants: number
  cabinClass: FlightCabinClass
}

export function buildFlightSearchQueryString(query: FlightSearchUrlQuery): string {
  const params = new URLSearchParams()
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

export function buildFlightSearchPath(
  route: { originSlug: string; destinationSlug: string },
  query: FlightSearchUrlQuery,
): string {
  return `/ve-may-bay/${route.originSlug}/${route.destinationSlug}?${buildFlightSearchQueryString(query)}`
}

const CABIN_CLASSES: FlightCabinClass[] = ['economy', 'premium_economy', 'business', 'first']

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

/**
 * Defensive parse of the raw `searchParams` Next.js hands to the route —
 * always returns a usable query (falling back to sane defaults for
 * missing/garbled values) rather than throwing, since the URL is
 * user-editable. `flight-search-repository.ts` still re-validates the
 * result with `flightSearchInputSchema` before generating mock offers.
 */
export function parseFlightSearchQueryParams(
  searchParams: Record<string, string | string[] | undefined>,
): FlightSearchUrlQuery {
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

  return {
    tripType,
    departDate,
    returnDate,
    adults: Math.max(1, parseCount(readParam(searchParams, QUERY_KEYS.adults), 1, 9)),
    children: parseCount(readParam(searchParams, QUERY_KEYS.children), 0, 8),
    infants: parseCount(readParam(searchParams, QUERY_KEYS.infants), 0, 8),
    cabinClass,
  }
}
