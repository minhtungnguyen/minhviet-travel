import 'server-only'
import { cache } from 'react'
import { flightAirports, flightAirlines, findFlightAirportBySlug } from '@/lib/flight/flight-data-seed'
import { flightSearchQuerySchema, flightSearchResultsSchema } from '@/lib/flight/flight-schema'
import { generateFlightOffers, generateFareCalendar } from '@/lib/flight/flight-search-mock'
import type { FlightSearchQuery, FlightSearchResults } from '@/types/flight'

export { findFlightAirportBySlug }

/**
 * The Search Results seam (EPIC-002) — mirrors `getFlightHomeContent()`.
 * Takes an already-parsed (but not yet trusted) query, validates it, and
 * returns fully-typed `FlightSearchResults`. Swap the body for a real
 * `integrations/flight/contracts/flight-provider.ts` call later; every
 * Search Results component depends only on the return type.
 */
export const getFlightSearchResults = cache(async (rawQuery: unknown): Promise<FlightSearchResults> => {
  const query: FlightSearchQuery = flightSearchQuerySchema.parse(rawQuery)

  const origin = flightAirports.find((airport) => airport.code === query.originCode)
  const destination = flightAirports.find((airport) => airport.code === query.destinationCode)
  if (!origin || !destination) {
    throw new Error(`Unknown route: ${query.originCode} -> ${query.destinationCode}`)
  }

  const offers = generateFlightOffers(query, origin, destination, flightAirlines)
  const fareCalendar = generateFareCalendar(query, origin, destination)

  return flightSearchResultsSchema.parse({ query, origin, destination, offers, fareCalendar })
})
