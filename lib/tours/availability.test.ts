import { test, expect } from 'vitest'
import {
  deriveDepartureAvailability,
  selectPrimaryDeparture,
  mapAvailabilityToCTA,
  buildTourCardViewModel,
} from './availability'
import type { TourDeparture } from '@/types/tour-availability'

const NOW = new Date('2026-07-24T00:00:00.000Z')

function departure(overrides: Partial<TourDeparture>): TourDeparture {
  return {
    id: 'dep-1',
    tourId: 'tour-1',
    departureDate: '2026-08-01T00:00:00.000Z',
    departurePoint: 'Hà Nội',
    availabilityStatus: 'AVAILABLE',
    capacity: 20,
    bookedSeats: 5,
    availableSeats: 15,
    saleOpenAt: null,
    saleCloseAt: null,
    price: 10000000,
    currency: 'VND',
    isActive: true,
    ...overrides,
  }
}

const target = { href: '/tour/demo', category: 'asia' }

// 1. AVAILABLE -> Còn chỗ -> Khám phá tour
test('AVAILABLE departure derives label "Còn chỗ" and CTA "Khám phá tour"', () => {
  const d = departure({ availabilityStatus: 'AVAILABLE', availableSeats: 15 })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('AVAILABLE')
  expect(availability.label).toBe('Còn chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  expect(cta.label).toBe('Khám phá tour')
  expect(cta.action).toBe('view-detail')
  expect(cta.href).toBe('/tour/demo')
})

// 2. LIMITED -> Sắp đủ chỗ -> Giữ chỗ tư vấn
test('AVAILABLE departure with seats at/under threshold is promoted to LIMITED', () => {
  const d = departure({ availabilityStatus: 'AVAILABLE', availableSeats: 3 })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('LIMITED')
  expect(availability.label).toBe('Sắp đủ chỗ')
  expect(availability.isUrgent).toBe(true)
  const cta = mapAvailabilityToCTA(availability, target, d.id)
  expect(cta.label).toBe('Giữ chỗ tư vấn')
  expect(cta.action).toBe('prefill-inquiry')
  expect(cta.href).toBe('/tour/demo?departure=dep-1')
})

test('explicit LIMITED status from backend is respected as-is', () => {
  const d = departure({ availabilityStatus: 'LIMITED', availableSeats: null })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('LIMITED')
})

// 3. CHECKING -> Đang kiểm tra chỗ -> Kiểm tra chỗ
test('null availabilityStatus derives CHECKING, not a guessed status', () => {
  const d = departure({ availabilityStatus: null, availableSeats: null })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('CHECKING')
  expect(availability.label).toBe('Đang kiểm tra chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  expect(cta.label).toBe('Kiểm tra chỗ')
  expect(cta.action).toBe('check-availability')
  expect(cta.href).toBe('#lead-form')
})

// 4. SOLD_OUT -> Hết chỗ -> Xem lịch khác
test('SOLD_OUT departure derives label "Hết chỗ" and CTA "Xem lịch khác"', () => {
  const d = departure({ availabilityStatus: 'SOLD_OUT', availableSeats: 0 })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('SOLD_OUT')
  expect(availability.label).toBe('Hết chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  expect(cta.label).toBe('Xem lịch khác')
  expect(cta.action).toBe('view-alternate-dates')
  expect(cta.href).toBe('/tour/demo#departures')
})

// 5. CLOSED -> Ngừng nhận khách -> Xem tour tương tự
test('CLOSED departure derives label "Ngừng nhận khách" and CTA "Xem tour tương tự"', () => {
  const d = departure({ availabilityStatus: 'CLOSED' })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('CLOSED')
  expect(availability.label).toBe('Ngừng nhận khách')
  const cta = mapAvailabilityToCTA(availability, target)
  expect(cta.label).toBe('Xem tour tương tự')
  expect(cta.action).toBe('view-similar-tours')
  expect(cta.href).toBe('/tours?category=asia')
})

test('a departure whose sale window already closed derives CLOSED even if raw status says AVAILABLE', () => {
  const d = departure({
    availabilityStatus: 'AVAILABLE',
    saleCloseAt: '2026-07-01T00:00:00.000Z', // before NOW
  })
  const availability = deriveDepartureAvailability(d, NOW)
  expect(availability.status).toBe('CLOSED')
})

// 6. departure quá khứ bị bỏ qua
test('selectPrimaryDeparture ignores past departures', () => {
  const past = departure({ id: 'past', departureDate: '2026-07-01T00:00:00.000Z' })
  const future = departure({ id: 'future', departureDate: '2026-08-15T00:00:00.000Z' })
  const result = selectPrimaryDeparture([past, future], NOW)
  expect(result?.id).toBe('future')
})

test('selectPrimaryDeparture ignores inactive departures', () => {
  const inactive = departure({ id: 'inactive', departureDate: '2026-08-01T00:00:00.000Z', isActive: false })
  const active = departure({ id: 'active', departureDate: '2026-08-10T00:00:00.000Z', isActive: true })
  const result = selectPrimaryDeparture([inactive, active], NOW)
  expect(result?.id).toBe('active')
})

// 7. chọn đúng ngày gần nhất (ưu tiên ngày còn nhận khách hơn ngày sold-out gần hơn)
test('selectPrimaryDeparture prefers the soonest departure that still accepts guests over a chronologically earlier sold-out one', () => {
  const soldOutSoon = departure({
    id: 'sold-out-soon',
    departureDate: '2026-07-28T00:00:00.000Z',
    availabilityStatus: 'SOLD_OUT',
  })
  const availableLater = departure({
    id: 'available-later',
    departureDate: '2026-08-05T00:00:00.000Z',
    availabilityStatus: 'AVAILABLE',
  })
  const result = selectPrimaryDeparture([soldOutSoon, availableLater], NOW)
  expect(result?.id).toBe('available-later')
})

test('selectPrimaryDeparture falls back to the soonest SOLD_OUT departure when nothing else accepts guests', () => {
  const soldOutSoon = departure({
    id: 'sold-out-soon',
    departureDate: '2026-07-28T00:00:00.000Z',
    availabilityStatus: 'SOLD_OUT',
  })
  const soldOutLater = departure({
    id: 'sold-out-later',
    departureDate: '2026-08-20T00:00:00.000Z',
    availabilityStatus: 'SOLD_OUT',
  })
  const result = selectPrimaryDeparture([soldOutLater, soldOutSoon], NOW)
  expect(result?.id).toBe('sold-out-soon')
})

// 8. thiếu availability data -> CHECKING
test('buildTourCardViewModel resolves CHECKING when the selected departure has no status data', () => {
  const d = departure({ availabilityStatus: null, availableSeats: null, bookedSeats: null })
  const tour = { id: 'tour-1', href: '/tour/demo', category: 'asia', departures: [d] }
  const viewModel = buildTourCardViewModel(tour, NOW)
  expect(viewModel.availability.status).toBe('CHECKING')
  expect(viewModel.cta.label).toBe('Kiểm tra chỗ')
})

// 9. không render badge sai khi tour không có departure
test('buildTourCardViewModel handles a tour with zero departures without throwing, and resolves CHECKING', () => {
  const tour = { id: 'tour-empty', href: '/tour/empty', category: 'domestic', departures: [] as TourDeparture[] }
  expect(() => buildTourCardViewModel(tour, NOW)).not.toThrow()
  const viewModel = buildTourCardViewModel(tour, NOW)
  expect(viewModel.primaryDeparture).toBe(null)
  expect(viewModel.availability.status).toBe('CHECKING')
  expect(viewModel.availability.availableSeats).toBe(null)
})

test('deriveDepartureAvailability never fabricates seat counts when data is null', () => {
  const availability = deriveDepartureAvailability(null, NOW)
  expect(availability.availableSeats).toBe(null)
  expect(availability.isUrgent).toBe(false)
})
