import { test, expect } from 'vitest'
import { generateBookingId, saveBookingDraft, loadBookingDraft } from '@/lib/flight/flight-booking-draft'
import { flightBookingDraftSchema } from '@/lib/flight/flight-booking-schema'
import type { FlightBookingDraft } from '@/types/flight'

test('generateBookingId produces unique, URL-safe ids', () => {
  const ids = new Set(Array.from({ length: 50 }, () => generateBookingId()))
  expect(ids.size).toBe(50)
  for (const id of ids) {
    expect(id).toMatch(/^booking-[a-z0-9]+-[a-z0-9]+$/)
  }
})

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
    selectedExtraServiceIds: ['seat-selection'],
    createdAt: '2026-08-10T00:00:00.000Z',
    ...overrides,
  }
}

test('flightBookingDraftSchema accepts a well-formed draft', () => {
  expect(flightBookingDraftSchema.safeParse(draft()).success).toBe(true)
})

test('flightBookingDraftSchema rejects a draft with no passengers', () => {
  expect(flightBookingDraftSchema.safeParse(draft({ passengers: [] })).success).toBe(false)
})

test('saveBookingDraft/loadBookingDraft are no-ops outside a browser (node test environment has no window)', () => {
  saveBookingDraft(draft())
  expect(loadBookingDraft('booking-abc-123')).toBeNull()
})

test('loadBookingDraft returns null for an id that was never saved', () => {
  expect(loadBookingDraft('booking-does-not-exist')).toBeNull()
})
