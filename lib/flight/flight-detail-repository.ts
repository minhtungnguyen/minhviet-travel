import 'server-only'
import { cache } from 'react'
import { flightAirports, flightAirlines } from '@/lib/flight/flight-data-seed'
import { flightSearchQuerySchema, flightDetailSchema } from '@/lib/flight/flight-schema'
import { generateFlightOffers } from '@/lib/flight/flight-search-mock'
import { generateFlightDetail } from '@/lib/flight/flight-detail-mock'
import { parseFlightId } from '@/lib/flight/flight-detail-id'
import type { FlightCabinClass, FlightDetail } from '@/types/flight'

export interface FlightDetailContext {
  cabinClass: FlightCabinClass
  adults: number
  children: number
  infants: number
}

/**
 * The Flight Detail seam (EPIC-003) — mirrors `getFlightSearchResults()`.
 * Returns `null` for an unknown/malformed `flightId` rather than
 * throwing: this route treats "flight not found" as an Empty/Error State
 * to render in-page (PRD §9), not a hard `notFound()` — see
 * docs/Handover/Flight/EPIC-003-HANDOVER.md for why (the same
 * `notFound()` + `loading.tsx` HTTP-200 issue documented in the EPIC-002
 * handover applies here too, and this route sidesteps it the same way
 * EPIC-002's query parsing does: never call `notFound()` on this route).
 */
export const getFlightDetail = cache(async (flightId: string, context: FlightDetailContext): Promise<FlightDetail | null> => {
  const parsed = parseFlightId(flightId)
  if (!parsed) return null

  const origin = flightAirports.find((airport) => airport.code === parsed.originCode)
  const destination = flightAirports.find((airport) => airport.code === parsed.destinationCode)
  if (!origin || !destination) return null

  const queryResult = flightSearchQuerySchema.safeParse({
    tripType: 'oneway',
    originCode: parsed.originCode,
    destinationCode: parsed.destinationCode,
    departDate: parsed.departDate,
    ...context,
  })
  if (!queryResult.success) return null
  const query = queryResult.data

  const offers = generateFlightOffers(query, origin, destination, flightAirlines)
  const offer = offers[parsed.index]
  if (!offer) return null

  const detail = generateFlightDetail(offer, query, origin, destination)
  return flightDetailSchema.parse(detail)
})
