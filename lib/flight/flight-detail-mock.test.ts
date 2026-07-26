import { test, expect } from 'vitest'
import { generateFlightOffers } from '@/lib/flight/flight-search-mock'
import { generateFlightDetail } from '@/lib/flight/flight-detail-mock'
import type { FlightAirline, FlightAirport, FlightSearchQuery } from '@/types/flight'

const HPH: FlightAirport = { code: 'HPH', slug: 'hai-phong', city: 'Hải Phòng', name: 'Sân bay Cát Bi', country: 'Việt Nam' }
const SGN: FlightAirport = { code: 'SGN', slug: 'ho-chi-minh', city: 'TP. Hồ Chí Minh', name: 'Sân bay Tân Sơn Nhất', country: 'Việt Nam' }

const airlines: FlightAirline[] = [
  { id: 'air-vn', code: 'VN', name: 'Vietnam Airlines', shortName: 'Vietnam Airlines', isInternational: true, order: 1, isActive: true },
  { id: 'air-vj', code: 'VJ', name: 'Vietjet Air', shortName: 'Vietjet Air', isInternational: true, order: 2, isActive: true },
]

const query: FlightSearchQuery = {
  tripType: 'oneway',
  originCode: 'HPH',
  destinationCode: 'SGN',
  departDate: '2026-08-20',
  adults: 2,
  children: 0,
  infants: 0,
  cabinClass: 'economy',
}

test('generateFlightDetail is deterministic for the same offer/query', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const first = generateFlightDetail(offers[0], query, HPH, SGN)
  const second = generateFlightDetail(offers[0], query, HPH, SGN)
  expect(second).toEqual(first)
})

test('segments cover the full offer duration exactly, including layovers', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const offerWithStop = offers.find((o) => o.stops > 0) ?? offers[0]
  const detail = generateFlightDetail(offerWithStop, query, HPH, SGN)

  const flightMinutes = detail.segments.reduce((sum, s) => sum + s.durationMinutes, 0)
  const layoverMinutes = detail.layovers.reduce((sum, l) => sum + l.durationMinutes, 0)
  expect(flightMinutes + layoverMinutes).toBe(offerWithStop.durationMinutes)
  expect(detail.segments).toHaveLength(offerWithStop.stops + 1)
  expect(detail.layovers).toHaveLength(offerWithStop.stops)
})

test('first segment departs at the same time as the offer, last segment arrives at the same time', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const offer = offers[0]
  const detail = generateFlightDetail(offer, query, HPH, SGN)
  expect(detail.segments[0].departTime).toBe(offer.departTime)
  expect(detail.segments.at(-1)!.arriveTime).toBe(offer.arriveTime)
})

test('fare options: exactly one recommended tier, matching the searched cabin class', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const detail = generateFlightDetail(offers[0], query, HPH, SGN)
  const recommended = detail.fareOptions.filter((f) => f.isRecommended)
  expect(recommended).toHaveLength(1)
  expect(recommended[0].tier).toBe('economy_standard')
  expect(detail.defaultFareOptionId).toBe(recommended[0].id)
})

test('fare options: business search recommends the Business tier instead', () => {
  const businessQuery: FlightSearchQuery = { ...query, cabinClass: 'business' }
  const offers = generateFlightOffers(businessQuery, HPH, SGN, airlines)
  const detail = generateFlightDetail(offers[0], businessQuery, HPH, SGN)
  const recommended = detail.fareOptions.find((f) => f.isRecommended)
  expect(recommended?.tier).toBe('business')
})

test('fare option totals equal baseFare + taxes + serviceFee', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const detail = generateFlightDetail(offers[0], query, HPH, SGN)
  for (const fare of detail.fareOptions) {
    expect(fare.baseFare + fare.taxes + fare.serviceFee).toBe(fare.totalPrice)
  }
})

test('fare tiers are strictly ordered by price: saver < standard < flex < business', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const detail = generateFlightDetail(offers[0], query, HPH, SGN)
  const byTier = Object.fromEntries(detail.fareOptions.map((f) => [f.tier, f.totalPrice]))
  expect(byTier.economy_saver).toBeLessThan(byTier.economy_standard)
  expect(byTier.economy_standard).toBeLessThan(byTier.economy_flex)
  expect(byTier.economy_flex).toBeLessThan(byTier.business)
})
