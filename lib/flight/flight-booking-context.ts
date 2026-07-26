import { parseFlightId } from '@/lib/flight/flight-detail-id'
import { flightAirports, flightAirlines } from '@/lib/flight/flight-data-seed'
import { generateFlightOffers } from '@/lib/flight/flight-search-mock'
import { generateFlightDetail } from '@/lib/flight/flight-detail-mock'
import { computeBookingPriceSummary } from '@/lib/flight/flight-booking-price'
import { flightExtraServices } from '@/lib/flight/flight-booking-data'
import type { FareOption, FlightBookingDraft, FlightBookingPriceSummary, FlightDetail } from '@/types/flight'

export interface ResolvedBookingContext {
  detail: FlightDetail
  fareOption: FareOption
  priceSummary: FlightBookingPriceSummary
}

/**
 * Re-derives the flight/fare/price context a `FlightBookingDraft` refers
 * to — none of it is persisted (see `types/flight.ts`'s `FlightBookingDraft`
 * doc comment), so every Payment page (EPIC-005) regenerates it the same
 * deterministic way `flight-detail-repository.ts` does server-side. This
 * function is intentionally plain (no `'server-only'`) so it can run in
 * the client components that read the draft from `sessionStorage`.
 * Returns `null` if the draft points at something that no longer
 * resolves (malformed flightId, unknown airports, missing fare option)
 * or — per PRD §8 "Tổng tiền lớn hơn 0" — a non-positive total.
 */
export function resolveBookingContext(draft: FlightBookingDraft): ResolvedBookingContext | null {
  const parsed = parseFlightId(draft.flightId)
  if (!parsed) return null

  const origin = flightAirports.find((airport) => airport.code === parsed.originCode)
  const destination = flightAirports.find((airport) => airport.code === parsed.destinationCode)
  if (!origin || !destination) return null

  const offers = generateFlightOffers(draft.query, origin, destination, flightAirlines)
  const offer = offers[parsed.index]
  if (!offer) return null

  const detail = generateFlightDetail(offer, draft.query, origin, destination)
  const fareOption = detail.fareOptions.find((option) => option.id === draft.fareOptionId) ?? detail.fareOptions[0]
  if (!fareOption) return null

  const selectedExtraServices = flightExtraServices.filter((service) => draft.selectedExtraServiceIds.includes(service.id))
  const priceSummary = computeBookingPriceSummary(fareOption, draft.query, selectedExtraServices)
  if (priceSummary.grandTotal <= 0) return null

  return { detail, fareOption, priceSummary }
}
