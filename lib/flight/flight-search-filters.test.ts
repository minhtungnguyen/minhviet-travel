import { test, expect } from 'vitest'
import { filterFlightOffers, sortFlightOffers, getTimeBucket, EMPTY_FLIGHT_FILTERS } from '@/lib/flight/flight-search-filters'
import type { FlightOffer } from '@/types/flight'

function offer(overrides: Partial<FlightOffer> = {}): FlightOffer {
  return {
    id: 'o1',
    airlineCode: 'VN',
    airlineName: 'Vietnam Airlines',
    flightNumber: 'VN123',
    originCode: 'HPH',
    destinationCode: 'SGN',
    departTime: '2026-08-20T01:00:00.000Z',
    arriveTime: '2026-08-20T03:00:00.000Z',
    durationMinutes: 120,
    stops: 0,
    stopAirportCodes: [],
    cabinClass: 'economy',
    baggage: { carryOnKg: 7, checkedKg: 20 },
    price: 1_000_000,
    currency: 'VND',
    isRecommended: false,
    ...overrides,
  }
}

test('getTimeBucket buckets by UTC hour', () => {
  expect(getTimeBucket('2026-08-20T02:00:00.000Z')).toBe('early')
  expect(getTimeBucket('2026-08-20T08:00:00.000Z')).toBe('morning')
  expect(getTimeBucket('2026-08-20T14:00:00.000Z')).toBe('afternoon')
  expect(getTimeBucket('2026-08-20T20:00:00.000Z')).toBe('evening')
})

test('filterFlightOffers with EMPTY_FLIGHT_FILTERS returns everything unchanged', () => {
  const offers = [offer({ id: 'a' }), offer({ id: 'b', price: 5_000_000 })]
  expect(filterFlightOffers(offers, EMPTY_FLIGHT_FILTERS)).toEqual(offers)
})

test('filterFlightOffers applies maxPrice', () => {
  const offers = [offer({ id: 'cheap', price: 800_000 }), offer({ id: 'pricey', price: 2_000_000 })]
  const result = filterFlightOffers(offers, { ...EMPTY_FLIGHT_FILTERS, maxPrice: 1_000_000 })
  expect(result.map((o) => o.id)).toEqual(['cheap'])
})

test('filterFlightOffers applies airline + stops together', () => {
  const offers = [
    offer({ id: 'vn-direct', airlineCode: 'VN', stops: 0 }),
    offer({ id: 'vn-1stop', airlineCode: 'VN', stops: 1 }),
    offer({ id: 'vj-direct', airlineCode: 'VJ', stops: 0 }),
  ]
  const result = filterFlightOffers(offers, { ...EMPTY_FLIGHT_FILTERS, airlineCodes: ['VN'], stops: 'direct' })
  expect(result.map((o) => o.id)).toEqual(['vn-direct'])
})

test('sortFlightOffers by price does not mutate the input array', () => {
  const offers = [offer({ id: 'b', price: 2_000_000 }), offer({ id: 'a', price: 1_000_000 })]
  const sorted = sortFlightOffers(offers, 'price')
  expect(sorted.map((o) => o.id)).toEqual(['a', 'b'])
  expect(offers.map((o) => o.id)).toEqual(['b', 'a'])
})

test('sortFlightOffers "recommended" puts the recommended offer first', () => {
  const offers = [offer({ id: 'a', price: 900_000 }), offer({ id: 'b', price: 1_500_000, isRecommended: true })]
  const sorted = sortFlightOffers(offers, 'recommended')
  expect(sorted[0].id).toBe('b')
})
