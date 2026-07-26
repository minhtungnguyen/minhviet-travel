import type { FlightCabinClass } from '@/types/flight'

/**
 * `FlightOffer.id` (built in `flight-search-mock.ts` as
 * `offer-{originCode}-{destinationCode}-{departDate}-{index}`) doubles as
 * the Flight Detail route's `flightId` — parsing it back out is what lets
 * `flight-detail-repository.ts` regenerate the exact same offer
 * deterministically instead of needing persisted storage.
 */

const FLIGHT_ID_PATTERN = /^offer-([A-Za-z]{3})-([A-Za-z]{3})-(\d{4}-\d{2}-\d{2})-(\d+)$/

export interface ParsedFlightId {
  originCode: string
  destinationCode: string
  departDate: string
  index: number
}

export function parseFlightId(flightId: string): ParsedFlightId | null {
  const match = FLIGHT_ID_PATTERN.exec(flightId)
  if (!match) return null
  const [, originCode, destinationCode, departDate, indexRaw] = match
  return {
    originCode: originCode.toUpperCase(),
    destinationCode: destinationCode.toUpperCase(),
    departDate,
    index: Number.parseInt(indexRaw, 10),
  }
}

/**
 * `FlightOffer.id` doesn't encode `cabinClass`/passenger counts, but the
 * seeded generator's output depends on them — so the Detail route needs
 * them carried as query params to regenerate the exact same offer the
 * user saw on Search Results. Always link to Flight Detail through this
 * helper, never by hand, so that context is never dropped.
 */
export function buildFlightDetailPath(
  flightId: string,
  context: { cabinClass: string; adults: number; children: number; infants: number },
): string {
  const params = new URLSearchParams({
    cabinClass: context.cabinClass,
    adults: String(context.adults),
    children: String(context.children),
    infants: String(context.infants),
  })
  return `/ve-may-bay/chi-tiet/${flightId}?${params.toString()}`
}

/**
 * Same context-carrying rule as `buildFlightDetailPath`, plus
 * `fareOptionId` — Booking (EPIC-004) needs to know which of
 * `FlightDetail.fareOptions` the visitor picked on the Detail page.
 * `flight-booking-repository`'s equivalent parsing lives inline in
 * `app/ve-may-bay/dat-ve/[flightId]/page.tsx` since it just re-resolves
 * a `fareOptionId` against an already-fetched `FlightDetail`, unlike
 * `flightId` itself which needs the dedicated regeneration logic above.
 */
export function buildFlightBookingPath(
  flightId: string,
  context: { fareOptionId: string; cabinClass: string; adults: number; children: number; infants: number },
): string {
  const params = new URLSearchParams({
    fareOptionId: context.fareOptionId,
    cabinClass: context.cabinClass,
    adults: String(context.adults),
    children: String(context.children),
    infants: String(context.infants),
  })
  return `/ve-may-bay/dat-ve/${flightId}?${params.toString()}`
}

export interface FlightDetailUrlContext {
  cabinClass: FlightCabinClass
  adults: number
  children: number
  infants: number
}

const CABIN_CLASSES: FlightCabinClass[] = ['economy', 'premium_economy', 'business', 'first']

function readRouteParam(searchParams: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

function parseRouteCount(value: string | undefined, fallback: number, max: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

/**
 * Shared by `/ve-may-bay/chi-tiet/[flightId]` and `/ve-may-bay/dat-ve/[flightId]`
 * — both need the same `?cabinClass=&adults=&children=&infants=` context to
 * regenerate the underlying offer via `getFlightDetail`. Defensive like
 * `parseFlightSearchQueryParams`: never throws, always returns a usable context.
 */
export function parseFlightDetailUrlContext(searchParams: Record<string, string | string[] | undefined>): FlightDetailUrlContext {
  const cabinClassRaw = readRouteParam(searchParams, 'cabinClass')
  const cabinClass = CABIN_CLASSES.includes(cabinClassRaw as FlightCabinClass) ? (cabinClassRaw as FlightCabinClass) : 'economy'

  return {
    cabinClass,
    adults: Math.max(1, parseRouteCount(readRouteParam(searchParams, 'adults'), 1, 9)),
    children: parseRouteCount(readRouteParam(searchParams, 'children'), 0, 8),
    infants: parseRouteCount(readRouteParam(searchParams, 'infants'), 0, 8),
  }
}
