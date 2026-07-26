import { partySize } from '@/lib/flight/flight-search-mock'
import type { FareOption, FlightPriceBreakdown, FlightSearchQuery } from '@/types/flight'

/**
 * Pure price-breakdown math (EPIC-003 §4.6) — splits a `FareOption`'s
 * per-passenger `serviceFee` into "phí sân bay" (airport fee) and "phí
 * dịch vụ" (service fee) for the itemized `PriceBreakdown` UI, and scales
 * everything to the searched party size. Kept separate from the mock
 * generator so it stays usable once `FareOption` comes from a real API.
 */
export function computePriceBreakdown(fareOption: FareOption, query: FlightSearchQuery): FlightPriceBreakdown {
  const seats = Math.max(1, partySize(query))
  const airportFeePerPax = Math.round(fareOption.serviceFee * 0.6)
  const serviceFeePerPax = fareOption.serviceFee - airportFeePerPax

  return {
    baseFarePerPax: fareOption.baseFare,
    taxesPerPax: fareOption.taxes,
    airportFeePerPax,
    serviceFeePerPax,
    surchargePerPax: 0,
    totalPerPax: fareOption.totalPrice,
    totalForParty: fareOption.totalPrice * seats,
    currency: fareOption.currency,
    passengerCount: { adults: query.adults, children: query.children, infants: query.infants },
  }
}
