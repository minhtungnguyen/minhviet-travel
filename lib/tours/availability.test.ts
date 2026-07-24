import { test } from 'node:test'
import assert from 'node:assert/strict'
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
  assert.equal(availability.status, 'AVAILABLE')
  assert.equal(availability.label, 'Còn chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  assert.equal(cta.label, 'Khám phá tour')
  assert.equal(cta.action, 'view-detail')
  assert.equal(cta.href, '/tour/demo')
})

// 2. LIMITED -> Sắp đủ chỗ -> Giữ chỗ tư vấn
test('AVAILABLE departure with seats at/under threshold is promoted to LIMITED', () => {
  const d = departure({ availabilityStatus: 'AVAILABLE', availableSeats: 3 })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'LIMITED')
  assert.equal(availability.label, 'Sắp đủ chỗ')
  assert.equal(availability.isUrgent, true)
  const cta = mapAvailabilityToCTA(availability, target, d.id)
  assert.equal(cta.label, 'Giữ chỗ tư vấn')
  assert.equal(cta.action, 'prefill-inquiry')
  assert.equal(cta.href, '/tour/demo?departure=dep-1')
})

test('explicit LIMITED status from backend is respected as-is', () => {
  const d = departure({ availabilityStatus: 'LIMITED', availableSeats: null })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'LIMITED')
})

// 3. CHECKING -> Đang kiểm tra chỗ -> Kiểm tra chỗ
test('null availabilityStatus derives CHECKING, not a guessed status', () => {
  const d = departure({ availabilityStatus: null, availableSeats: null })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'CHECKING')
  assert.equal(availability.label, 'Đang kiểm tra chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  assert.equal(cta.label, 'Kiểm tra chỗ')
  assert.equal(cta.action, 'check-availability')
  assert.equal(cta.href, '#lead-form')
})

// 4. SOLD_OUT -> Hết chỗ -> Xem lịch khác
test('SOLD_OUT departure derives label "Hết chỗ" and CTA "Xem lịch khác"', () => {
  const d = departure({ availabilityStatus: 'SOLD_OUT', availableSeats: 0 })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'SOLD_OUT')
  assert.equal(availability.label, 'Hết chỗ')
  const cta = mapAvailabilityToCTA(availability, target)
  assert.equal(cta.label, 'Xem lịch khác')
  assert.equal(cta.action, 'view-alternate-dates')
  assert.equal(cta.href, '/tour/demo#departures')
})

// 5. CLOSED -> Ngừng nhận khách -> Xem tour tương tự
test('CLOSED departure derives label "Ngừng nhận khách" and CTA "Xem tour tương tự"', () => {
  const d = departure({ availabilityStatus: 'CLOSED' })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'CLOSED')
  assert.equal(availability.label, 'Ngừng nhận khách')
  const cta = mapAvailabilityToCTA(availability, target)
  assert.equal(cta.label, 'Xem tour tương tự')
  assert.equal(cta.action, 'view-similar-tours')
  assert.equal(cta.href, '/tours?category=asia')
})

test('a departure whose sale window already closed derives CLOSED even if raw status says AVAILABLE', () => {
  const d = departure({
    availabilityStatus: 'AVAILABLE',
    saleCloseAt: '2026-07-01T00:00:00.000Z', // before NOW
  })
  const availability = deriveDepartureAvailability(d, NOW)
  assert.equal(availability.status, 'CLOSED')
})

// 6. departure quá khứ bị bỏ qua
test('selectPrimaryDeparture ignores past departures', () => {
  const past = departure({ id: 'past', departureDate: '2026-07-01T00:00:00.000Z' })
  const future = departure({ id: 'future', departureDate: '2026-08-15T00:00:00.000Z' })
  const result = selectPrimaryDeparture([past, future], NOW)
  assert.equal(result?.id, 'future')
})

test('selectPrimaryDeparture ignores inactive departures', () => {
  const inactive = departure({ id: 'inactive', departureDate: '2026-08-01T00:00:00.000Z', isActive: false })
  const active = departure({ id: 'active', departureDate: '2026-08-10T00:00:00.000Z', isActive: true })
  const result = selectPrimaryDeparture([inactive, active], NOW)
  assert.equal(result?.id, 'active')
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
  assert.equal(result?.id, 'available-later')
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
  assert.equal(result?.id, 'sold-out-soon')
})

// 8. thiếu availability data -> CHECKING
test('buildTourCardViewModel resolves CHECKING when the selected departure has no status data', () => {
  const d = departure({ availabilityStatus: null, availableSeats: null, bookedSeats: null })
  const tour = { id: 'tour-1', href: '/tour/demo', category: 'asia', departures: [d] }
  const viewModel = buildTourCardViewModel(tour, NOW)
  assert.equal(viewModel.availability.status, 'CHECKING')
  assert.equal(viewModel.cta.label, 'Kiểm tra chỗ')
})

// 9. không render badge sai khi tour không có departure
test('buildTourCardViewModel handles a tour with zero departures without throwing, and resolves CHECKING', () => {
  const tour = { id: 'tour-empty', href: '/tour/empty', category: 'domestic', departures: [] as TourDeparture[] }
  assert.doesNotThrow(() => buildTourCardViewModel(tour, NOW))
  const viewModel = buildTourCardViewModel(tour, NOW)
  assert.equal(viewModel.primaryDeparture, null)
  assert.equal(viewModel.availability.status, 'CHECKING')
  assert.equal(viewModel.availability.availableSeats, null)
})

test('deriveDepartureAvailability never fabricates seat counts when data is null', () => {
  const availability = deriveDepartureAvailability(null, NOW)
  assert.equal(availability.availableSeats, null)
  assert.equal(availability.isUrgent, false)
})
