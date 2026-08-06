import { Clock, MapPin } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { Badge } from '@/components/ui/badge'
import type { PublicTourDetail } from '@/lib/tours/public-tours'
import { formatTourPrice, TOUR_AVAILABILITY_COPY } from '@/lib/tours/format'
import { contactHref } from '@/constants/routes'

/**
 * Booking Request itself is out of scope (see PROJECT_AUDIT.md §6 "Module
 * thiếu" and Volume 00 §02: V1 does not let customers self-checkout —
 * every request routes through a human advisor). This card's CTA is a
 * request-consultation hand-off, not a payment/booking flow.
 */
export function TourBookingCard({ tour }: { tour: PublicTourDetail }) {
  const status = tour.availability ? TOUR_AVAILABILITY_COPY[tour.availability] : null

  return (
    <div className="lg:sticky lg:top-24 rounded-3xl bg-card p-7 shadow-soft-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-[11px] font-semibold text-muted-foreground">
          {tour.priceType === 'CONFIRMED' ? 'Giá' : 'Giá tham khảo'}
        </p>
        {status && <Badge variant={status.variant}>{status.label}</Badge>}
      </div>
      <p className="mt-1 font-display text-3xl font-extrabold text-primary">{formatTourPrice(tour.priceFrom)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        / khách {tour.priceType !== 'CONFIRMED' && '· Xác nhận khi đặt chỗ'}
      </p>

      <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-foreground">
        {tour.duration && (
          <li className="flex items-center gap-2.5">
            <Clock className="size-4 text-royal" /> {tour.duration}
          </li>
        )}
        {tour.departureCity && (
          <li className="flex items-center gap-2.5">
            <MapPin className="size-4 text-royal" /> Điểm đi: {tour.departureCity}
          </li>
        )}
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
