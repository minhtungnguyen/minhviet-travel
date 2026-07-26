import type { BookingExtraService } from '@/types/flight'

/**
 * Extra Services catalog (EPIC-004 §4) — a static content list, not
 * generated per-search like `FlightOffer`/`FlightDetail` are (an add-on
 * catalog doesn't vary by route or date the way fares do). Mock Data
 * only, per PRD scope; swap for a real CMS/catalog source later.
 */
export const flightExtraServices: BookingExtraService[] = [
  {
    id: 'extra-baggage-10kg',
    type: 'extra_baggage',
    name: 'Hành lý ký gửi thêm 10kg',
    description: 'Cộng thêm 10kg hành lý ký gửi ngoài mức đã bao gồm trong hạng vé.',
    price: 250_000,
    currency: 'VND',
  },
  {
    id: 'extra-baggage-20kg',
    type: 'extra_baggage',
    name: 'Hành lý ký gửi thêm 20kg',
    description: 'Cộng thêm 20kg hành lý ký gửi ngoài mức đã bao gồm trong hạng vé.',
    price: 450_000,
    currency: 'VND',
  },
  {
    id: 'seat-selection',
    type: 'seat_selection',
    name: 'Chọn chỗ ngồi yêu thích',
    description: 'Chọn trước vị trí ghế ngồi (cửa sổ, lối đi, hàng ghế ưu tiên) thay vì để hệ thống xếp tự động.',
    price: 150_000,
    currency: 'VND',
  },
  {
    id: 'travel-insurance',
    type: 'travel_insurance',
    name: 'Bảo hiểm du lịch toàn diện',
    description: 'Bảo hiểm tai nạn, y tế và chậm/hủy chuyến trong suốt hành trình.',
    price: 90_000,
    currency: 'VND',
  },
]
