import { FileSearch, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/**
 * "Booking không tồn tại" (EPIC-005 §8 mandatory validation). Reached
 * when a `bookingId` doesn't resolve in `sessionStorage` — an old/shared
 * link, a different tab, or a cleared session. This is an accurate
 * state for a client-only mock draft, not a bug — see `flight-booking-draft.ts`.
 */
export function FlightPaymentBookingNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <FileSearch className="size-10 text-muted-foreground" />
      <h3 className="font-display text-lg font-bold text-foreground">Không tìm thấy đơn đặt vé này</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Đơn đặt vé chỉ khả dụng trong phiên trình duyệt đã tạo đơn. Vui lòng quay lại tìm chuyến bay hoặc gọi hotline để được hỗ trợ tra cứu.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <MVButton href="/ve-may-bay" variant="outline" size="md">
          Tìm chuyến bay
        </MVButton>
        <MVButton href="tel:0934368132" variant="accent" size="md">
          <Phone className="size-4" />
          0934 368 132
        </MVButton>
      </div>
    </div>
  )
}
