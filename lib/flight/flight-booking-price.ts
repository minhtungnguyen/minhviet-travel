import { computePriceBreakdown } from '@/lib/flight/flight-detail-price'
import { partySize } from '@/lib/flight/flight-search-mock'
import type { BookingExtraService, FareOption, FlightBookingPriceSummary, FlightSearchQuery } from '@/types/flight'

/**
 * Booking Price Summary (EPIC-004 §4) — the selected `FareOption`'s
 * breakdown (reusing EPIC-003's `computePriceBreakdown`) plus whichever
 * extras the visitor picked, each scaled by party size the same way
 * fares are.
 */
export function computeBookingPriceSummary(
  fareOption: FareOption,
  query: FlightSearchQuery,
  selectedExtraServices: BookingExtraService[],
): FlightBookingPriceSummary {
  const fareBreakdown = computePriceBreakdown(fareOption, query)
  const seats = Math.max(1, partySize(query))
  const extrasTotalForParty = selectedExtraServices.reduce((sum, service) => sum + service.price * seats, 0)

  return {
    fareBreakdown,
    selectedExtraServices,
    extrasTotalForParty,
    grandTotal: fareBreakdown.totalForParty + extrasTotalForParty,
    currency: 'VND',
  }
}
