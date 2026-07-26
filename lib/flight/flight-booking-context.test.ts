import { test, expect } from 'vitest'
import { resolveBookingContext } from '@/lib/flight/flight-booking-context'
import type { FlightBookingDraft } from '@/types/flight'

function draft(overrides: Partial<FlightBookingDraft> = {}): FlightBookingDraft {
  return {
    bookingId: 'booking-abc-123',
    flightId: 'offer-HPH-SGN-2026-08-20-0',
    fareOptionId: 'offer-HPH-SGN-2026-08-20-0-fare-economy_standard',
    query: {
      tripType: 'oneway',
      originCode: 'HPH',
      destinationCode: 'SGN',
      departDate: '2026-08-20',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
    },
    contact: { fullName: 'Nguyễn Văn A', email: 'a@example.com', phone: '0912345678' },
    passengers: [
      {
        id: 'adult-0',
        type: 'adult',
        fullName: 'Nguyễn Văn A',
        gender: 'male',
        dateOfBirth: '1990-01-01',
        nationality: 'Việt Nam',
        documentType: 'cccd',
        documentNumber: '012345678901',
      },
    ],
    selectedExtraServiceIds: [],
    createdAt: '2026-08-10T00:00:00.000Z',
    ...overrides,
  }
}

test('resolveBookingContext reconstructs the same flight the draft was created from', () => {
  const context = resolveBookingContext(draft())
  expect(context).not.toBeNull()
  expect(context!.detail.id).toBe('offer-HPH-SGN-2026-08-20-0')
  expect(context!.fareOption.id).toBe('offer-HPH-SGN-2026-08-20-0-fare-economy_standard')
  expect(context!.priceSummary.grandTotal).toBeGreaterThan(0)
})

test('resolveBookingContext is deterministic across calls', () => {
  const first = resolveBookingContext(draft())
  const second = resolveBookingContext(draft())
  expect(second).toEqual(first)
})

test('resolveBookingContext returns null for a malformed flightId', () => {
  expect(resolveBookingContext(draft({ flightId: 'not-a-real-id' }))).toBeNull()
})

test('resolveBookingContext adds selected extra service costs into the total', () => {
  const withoutExtras = resolveBookingContext(draft())!
  const withExtras = resolveBookingContext(draft({ selectedExtraServiceIds: ['seat-selection'] }))!
  expect(withExtras.priceSummary.grandTotal).toBeGreaterThan(withoutExtras.priceSummary.grandTotal)
})
