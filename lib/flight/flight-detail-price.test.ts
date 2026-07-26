import { test, expect } from 'vitest'
import { computePriceBreakdown } from '@/lib/flight/flight-detail-price'
import type { FareOption, FlightSearchQuery } from '@/types/flight'

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
  children: 1,
  infants: 1,
  cabinClass: 'economy',
}

test('computePriceBreakdown splits serviceFee into airportFee + serviceFee, summing back exactly', () => {
  const breakdown = computePriceBreakdown(fareOption, query)
  expect(breakdown.airportFeePerPax + breakdown.serviceFeePerPax).toBe(fareOption.serviceFee)
  expect(breakdown.baseFarePerPax + breakdown.taxesPerPax + breakdown.airportFeePerPax + breakdown.serviceFeePerPax + breakdown.surchargePerPax).toBe(
    fareOption.totalPrice,
  )
})

test('computePriceBreakdown scales total by adults+children, excluding infants', () => {
  const breakdown = computePriceBreakdown(fareOption, query)
  expect(breakdown.totalForParty).toBe(fareOption.totalPrice * 3)
})
