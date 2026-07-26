import { test, expect } from 'vitest'
import { generateFlightOffers, generateFareCalendar } from '@/lib/flight/flight-search-mock'
import type { FlightAirline, FlightAirport, FlightSearchQuery } from '@/types/flight'

const HPH: FlightAirport = { code: 'HPH', slug: 'hai-phong', city: 'Hải Phòng', name: 'Sân bay Cát Bi', country: 'Việt Nam' }
const SGN: FlightAirport = { code: 'SGN', slug: 'ho-chi-minh', city: 'TP. Hồ Chí Minh', name: 'Sân bay Tân Sơn Nhất', country: 'Việt Nam' }
const NRT: FlightAirport = { code: 'NRT', slug: 'tokyo', city: 'Tokyo', name: 'Sân bay Narita', country: 'Nhật Bản' }

const airlines: FlightAirline[] = [
  { id: 'air-vn', code: 'VN', name: 'Vietnam Airlines', shortName: 'Vietnam Airlines', isInternational: true, order: 1, isActive: true },
  { id: 'air-vj', code: 'VJ', name: 'Vietjet Air', shortName: 'Vietjet Air', isInternational: true, order: 2, isActive: true },
  { id: 'air-vu', code: 'VU', name: 'Vietravel Airlines', shortName: 'Vietravel Airlines', isInternational: false, order: 4, isActive: true },
]

const query: FlightSearchQuery = {
  tripType: 'oneway',
  originCode: 'HPH',
  destinationCode: 'SGN',
  departDate: '2026-08-20',
  adults: 2,
  children: 1,
  infants: 0,
  cabinClass: 'economy',
}

test('generateFlightOffers is deterministic for the same route/date/cabin', () => {
  const first = generateFlightOffers(query, HPH, SGN, airlines)
  const second = generateFlightOffers(query, HPH, SGN, airlines)
  expect(second).toEqual(first)
})

test('generateFlightOffers returns 8-12 offers with exactly one recommended', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  expect(offers.length).toBeGreaterThanOrEqual(8)
  expect(offers.length).toBeLessThanOrEqual(12)
  expect(offers.filter((o) => o.isRecommended)).toHaveLength(1)
})

test('offer price scales with party size (2 adults + 1 child = 3 seats)', () => {
  const offers = generateFlightOffers(query, HPH, SGN, airlines)
  const soloOffers = generateFlightOffers({ ...query, adults: 1, children: 0 }, HPH, SGN, airlines)
  // same seed inputs (route/date/cabin) drive per-seat price identically, so 3x party should be ~3x price
  expect(offers[0].price).toBe(soloOffers[0].price * 3)
})

test('a domestic-only airline (Vietravel) never appears on an international route', () => {
  const offers = generateFlightOffers({ ...query, originCode: 'HPH', destinationCode: 'NRT' }, HPH, NRT, airlines)
  expect(offers.some((o) => o.airlineCode === 'VU')).toBe(false)
})

test('generateFareCalendar returns 7 days centered on departDate with exactly one cheapest', () => {
  const days = generateFareCalendar(query, HPH, SGN)
  expect(days).toHaveLength(7)
  expect(days[3].date).toBe('2026-08-20')
  expect(days[3].isSelected).toBe(true)
  expect(days.filter((d) => d.isCheapest)).toHaveLength(1)
})
