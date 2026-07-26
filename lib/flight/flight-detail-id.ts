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
