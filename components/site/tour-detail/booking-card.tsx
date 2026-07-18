import { Clock, MapPin } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { Badge } from '@/components/ui/badge'
import type { Tour } from '@/lib/site-data'
import type { AvailabilityStatus, PriceType } from '@/types/cms'
import { contactHref } from '@/constants/routes'

const AVAILABILITY_COPY: Record<AvailabilityStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'info' }> = {
  open: { label: 'Còn nhận khách', variant: 'success' },
  limited: { label: 'Sắp hết chỗ', variant: 'warning' },
  'almost-full': { label: 'Gần kín', variant: 'warning' },
  closed: { label: 'Hết chỗ', variant: 'neutral' },
  'pending-confirmation': { label: 'Chờ xác nhận', variant: 'info' },
}

/**
 * Booking Request itself is out of scope for this task (see
 * PROJECT_AUDIT.md §6 "Module thiếu" and Volume 00 §02: V1 does not let
 * customers self-checkout — every request routes through a human
 * advisor). This card's CTA is a request-consultation hand-off, not a
 * payment/booking flow.
 */
export function TourBookingCard({
  tour,
  priceType,
  availability,
}: {
  tour: Tour
  priceType: PriceType
  availability: AvailabilityStatus
}) {
  const status = AVAILABILITY_COPY[availability]

  return (
    <div className="lg:sticky lg:top-24 rounded-3xl bg-card p-7 shadow-soft-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-[11px] font-semibold text-muted-foreground">
          {priceType === 'confirmed' ? 'Giá' : 'Giá tham khảo'}
        </p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <p className="mt-1 font-display text-3xl font-extrabold text-primary">{tour.price}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        / khách {priceType === 'estimate' && '· Xác nhận khi đặt chỗ'}
      </p>

      <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-foreground">
        <li className="flex items-center gap-2.5">
          <Clock className="size-4 text-royal" /> {tour.duration}
        </li>
        <li className="flex items-center gap-2.5">
          <MapPin className="size-4 text-royal" /> Điểm đi: {tour.departure}
        </li>
      </ul>

      <MVButton href={contactHref('individual')} variant="gold" size="lg" className="mt-7 w-full">
        Nhận tư vấn giải pháp
      </MVButton>
      <MVButton href="tel:0934368132" variant="outline" size="lg" className="mt-3 w-full">
        Gọi hotline 24/7
      </MVButton>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Yêu cầu của bạn sẽ được chuyên viên Minh Việt xác nhận trước khi chốt dịch vụ.
      </p>
    </div>
  )
}
