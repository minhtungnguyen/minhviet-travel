import { test, expect } from 'vitest'
import { parseFlightId } from '@/lib/flight/flight-detail-id'

test('parseFlightId extracts route/date/index from a well-formed id', () => {
  expect(parseFlightId('offer-HPH-SGN-2026-08-20-3')).toEqual({
    originCode: 'HPH',
    destinationCode: 'SGN',
    departDate: '2026-08-20',
    index: 3,
  })
})

test('parseFlightId returns null for a malformed id', () => {
  expect(parseFlightId('not-a-flight-id')).toBeNull()
  expect(parseFlightId('offer-HP-SGN-2026-08-20-0')).toBeNull()
  expect(parseFlightId('offer-HPH-SGN-20-08-2026-0')).toBeNull()
})
