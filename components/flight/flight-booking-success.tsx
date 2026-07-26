import { CheckCircle2, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { formatVnd } from '@/lib/flight/flight-format'

/**
 * Shown after the booking form passes validation (EPIC-004 §3: no real
 * booking/payment in this epic). Same honesty pattern used at every
 * "next step doesn't exist yet" CTA across the Flight module — Payment
 * is EPIC-005, not built, so this confirms what was captured and hands
 * off to a real hotline instead of a dead route.
 */
export function FlightBookingSuccess({ grandTotal }: { grandTotal: number }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center shadow-soft-lg">
      <span className="grid size-14 place-items-center rounded-full bg-mv-mist-blue text-mv-journey-blue">
        <CheckCircle2 className="size-7" />
      </span>
      <h2 className="font-display text-xl font-bold text-foreground">Đã ghi nhận thông tin đặt vé</h2>
      <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        Tổng tiền tạm tính <span className="font-semibold text-foreground">{formatVnd(grandTotal)}</span>. Bước thanh toán
        trực tuyến sẽ sớm ra mắt — gọi hotline để tư vấn viên xác nhận và giữ chỗ ngay hôm nay:
      </p>
      <MVButton href="tel:0934368132" variant="accent" size="lg" className="mt-2">
        <Phone className="size-4" />
        0934 368 132
      </MVButton>
    </div>
  )
}
