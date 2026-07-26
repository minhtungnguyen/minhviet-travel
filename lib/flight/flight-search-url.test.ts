import { test, expect } from 'vitest'
import { buildFlightSearchPath, buildFlightSearchQueryString, parseFlightSearchQueryParams } from '@/lib/flight/flight-search-url'

test('buildFlightSearchPath produces the PRD-documented friendly URL shape', () => {
  const path = buildFlightSearchPath(
    { originSlug: 'hai-phong', destinationSlug: 'ho-chi-minh' },
    { tripType: 'oneway', departDate: '2026-08-20', adults: 1, children: 0, infants: 0, cabinClass: 'economy' },
  )
  expect(path.startsWith('/ve-may-bay/hai-phong/ho-chi-minh?')).toBe(true)
})

test('roundtrip query string omits returnDate when tripType is oneway', () => {
  const qs = buildFlightSearchQueryString({
    tripType: 'oneway',
    departDate: '2026-08-20',
    returnDate: '2026-08-25',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
  })
  expect(qs).not.toContain('ngayVe')
})

test('parseFlightSearchQueryParams round-trips a valid query built by buildFlightSearchQueryString', () => {
  const built = buildFlightSearchQueryString({
    tripType: 'roundtrip',
    departDate: '2026-08-20',
    returnDate: '2026-08-27',
    adults: 2,
    children: 1,
    infants: 1,
    cabinClass: 'business',
  })
  const params = Object.fromEntries(new URLSearchParams(built))
  const parsed = parseFlightSearchQueryParams(params)

  expect(parsed).toEqual({
    tripType: 'roundtrip',
    departDate: '2026-08-20',
    returnDate: '2026-08-27',
    adults: 2,
    children: 1,
    infants: 1,
    cabinClass: 'business',
  })
})

test('parseFlightSearchQueryParams falls back to safe defaults for garbage input', () => {
  const parsed = parseFlightSearchQueryParams({ ngayDi: 'not-a-date', nguoiLon: 'abc', hang: 'ultra-vip' })
  expect(parsed.tripType).toBe('oneway')
  expect(parsed.departDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(parsed.adults).toBe(1)
  expect(parsed.cabinClass).toBe('economy')
})
