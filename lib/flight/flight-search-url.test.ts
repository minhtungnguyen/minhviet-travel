import { test, expect } from 'vitest'
import {
  buildFlightSearchUrl,
  buildFlightSearchQueryString,
  parseFlightSearchQueryParams,
  DEFAULT_ORIGIN_CODE,
  DEFAULT_DESTINATION_CODE,
} from '@/lib/flight/flight-search-url'
import type { FlightSearchQuery } from '@/types/flight'

function query(overrides: Partial<FlightSearchQuery> = {}): FlightSearchQuery {
  return {
    tripType: 'oneway',
    originCode: 'HPH',
    destinationCode: 'SGN',
    departDate: '2026-08-20',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
    ...overrides,
  }
}

test('buildFlightSearchUrl points at the dedicated search route, not a path-segment slug URL', () => {
  const url = buildFlightSearchUrl(query())
  expect(url.startsWith('/ve-may-bay/tim-kiem?')).toBe(true)
  expect(url).toContain('from=HPH')
  expect(url).toContain('to=SGN')
})

test('roundtrip query string omits returnDate when tripType is oneway', () => {
  const qs = buildFlightSearchQueryString(query({ tripType: 'oneway', returnDate: '2026-08-25' }))
  expect(qs).not.toContain('returnDate')
})

test('parseFlightSearchQueryParams round-trips a valid query built by buildFlightSearchQueryString', () => {
  const built = buildFlightSearchQueryString(
    query({
      tripType: 'roundtrip',
      originCode: 'HAN',
      destinationCode: 'DAD',
      departDate: '2026-08-20',
      returnDate: '2026-08-27',
      adults: 2,
      children: 1,
      infants: 1,
      cabinClass: 'business',
    }),
  )
  const params = Object.fromEntries(new URLSearchParams(built))
  const parsed = parseFlightSearchQueryParams(params)

  expect(parsed).toEqual({
    tripType: 'roundtrip',
    originCode: 'HAN',
    destinationCode: 'DAD',
    departDate: '2026-08-20',
    returnDate: '2026-08-27',
    adults: 2,
    children: 1,
    infants: 1,
    cabinClass: 'business',
  })
})

test('parseFlightSearchQueryParams falls back to safe defaults for garbage input', () => {
  const parsed = parseFlightSearchQueryParams({ departureDate: 'not-a-date', adults: 'abc', cabinClass: 'ultra-vip' })
  expect(parsed.tripType).toBe('oneway')
  expect(parsed.departDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(parsed.adults).toBe(1)
  expect(parsed.cabinClass).toBe('economy')
  expect(parsed.originCode).toBe(DEFAULT_ORIGIN_CODE)
  expect(parsed.destinationCode).toBe(DEFAULT_DESTINATION_CODE)
})

test('parseFlightSearchQueryParams never returns originCode === destinationCode, even if the URL asks for it', () => {
  const parsed = parseFlightSearchQueryParams({ from: 'HPH', to: 'HPH' })
  expect(parsed.originCode).not.toBe(parsed.destinationCode)
})

test('parseFlightSearchQueryParams rejects a malformed airport code and falls back to the default', () => {
  const parsed = parseFlightSearchQueryParams({ from: 'not-a-code' })
  expect(parsed.originCode).toBe(DEFAULT_ORIGIN_CODE)
})
