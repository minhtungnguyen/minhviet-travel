import { test, expect } from 'vitest'
import { computeBookingPriceSummary } from '@/lib/flight/flight-booking-price'
import type { BookingExtraService, FareOption, FlightSearchQuery } from '@/types/flight'

const fareOption: FareOption = {
  id: 'offer-HPH-SGN-2026-08-20-0-fare-economy_standard',
  tier: 'economy_standard',
  name: 'Economy Standard',
  baseFare: 750_000,
  taxes: 180_000,
  serviceFee: 70_000,
  totalPrice: 1_000_000,
  currency: 'VND',
  baggage: { carryOnKg: 7, checkedKg: 20 },
  mealIncluded: false,
  seatSelectionIncluded: false,
  changePolicy: 'Đổi vé có phí',
  refundPolicy: 'Không được hoàn vé',
  changeFee: 150_000,
  refundFee: null,
  isRecommended: true,
}

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

const extras: BookingExtraService[] = [
  { id: 'seat-selection', type: 'seat_selection', name: 'Chọn chỗ ngồi', description: '', price: 150_000, currency: 'VND' },
]

test('computeBookingPriceSummary with no extras equals the fare breakdown total', () => {
  const summary = computeBookingPriceSummary(fareOption, query, [])
  expect(summary.extrasTotalForParty).toBe(0)
  expect(summary.grandTotal).toBe(summary.fareBreakdown.totalForParty)
})

test('computeBookingPriceSummary scales extras by party size (2 adults)', () => {
  const summary = computeBookingPriceSummary(fareOption, query, extras)
  expect(summary.extrasTotalForParty).toBe(150_000 * 2)
  expect(summary.grandTotal).toBe(summary.fareBreakdown.totalForParty + 300_000)
})
