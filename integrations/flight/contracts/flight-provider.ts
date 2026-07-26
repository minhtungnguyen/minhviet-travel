/**
 * Contract every future flight provider adapter (Bảo Gia Trần, an
 * airline API, an aggregator, a GDS) must implement. Nothing calls this
 * yet — master-prompt §9.1: "Do not implement these operations now."
 * This file exists so a real implementation in a later sprint has a
 * fixed shape to conform to. The Integration Registry module
 * (`integration_providers`/`integration_connections`) was deferred
 * entirely in Sprint 1A.2 (no live provider is wired up yet) — it
 * returns, keyed `'FLIGHT_API'`, once a real flight provider is built
 * against this contract (docs/backend/sprint-1a2-reduction-report.md §6).
 */
export type FlightSearchQuery = {
  originAirportCode: string
  destinationAirportCode: string
  departureDate: string
  returnDate?: string
  passengers: { adults: number; children: number; infants: number }
  fareClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
}

export type FlightOffer = {
  providerOfferId: string
  airline: string
  fareClass: string
  price: number
  currency: string
  segments: Array<{ flightNumber: string; departureAt: string; arrivalAt: string }>
}

export type FlightReservation = {
  providerReservationId: string
  pnr: string | null
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'TICKETED'
}

export interface FlightProvider {
  search(query: FlightSearchQuery): Promise<FlightOffer[]>
  revalidate(providerOfferId: string): Promise<FlightOffer>
  createReservation(providerOfferId: string, passengers: unknown): Promise<FlightReservation>
  retrieveReservation(providerReservationId: string): Promise<FlightReservation>
  cancelReservation(providerReservationId: string): Promise<void>
  getFareRules(providerOfferId: string): Promise<{ baggage: string; changePolicy: string; refundPolicy: string }>
}
