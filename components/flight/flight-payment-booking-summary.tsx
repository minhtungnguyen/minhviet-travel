import { formatClockTime, formatVnd } from '@/lib/flight/flight-format'
import type { BookingPassenger, FareOption, FlightBookingPriceSummary, FlightDetail } from '@/types/flight'

const TYPE_LABELS: Record<BookingPassenger['type'], string> = { adult: 'Người lớn', child: 'Trẻ em', infant: 'Em bé' }

/** Booking Summary (EPIC-005 §4) — mã đơn, chuyến bay, hành khách, giá, dịch vụ thêm, tổng tiền. */
export function FlightPaymentBookingSummary({
  bookingId,
  detail,
  fareOption,
  passengers,
  priceSummary,
}: {
  bookingId: string
  detail: FlightDetail
  fareOption: FareOption
  passengers: BookingPassenger[]
  priceSummary: FlightBookingPriceSummary
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-base font-bold text-foreground">Tóm tắt đơn hàng</p>
        <p className="font-mono text-xs text-muted-foreground">Mã đơn: {bookingId}</p>
      </div>

      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="bg-gradient-mv-brand grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white">
          {detail.airlineCode}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {detail.origin.city} ({detail.origin.code}) → {detail.destination.city} ({detail.destination.code})
          </p>
          <p className="text-xs text-muted-foreground">
            {formatClockTime(detail.segments[0].departTime)} – {formatClockTime(detail.segments.at(-1)!.arriveTime)} · {detail.airlineName}{' '}
            {detail.flightNumber} · {fareOption.name}
          </p>
        </div>
      </div>

      <div className="border-b border-border py-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Hành khách ({passengers.length})</p>
        <ul className="flex flex-col gap-1 text-sm text-foreground">
          {passengers.map((passenger) => (
            <li key={passenger.id} className="flex items-center justify-between">
              <span>{passenger.fullName || '—'}</span>
              <span className="text-xs text-muted-foreground">{TYPE_LABELS[passenger.type]}</span>
            </li>
          ))}
        </ul>
      </div>

      {priceSummary.selectedExtraServices.length > 0 && (
        <div className="border-b border-border py-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Dịch vụ thêm</p>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {priceSummary.selectedExtraServices.map((service) => (
              <li key={service.id} className="flex items-center justify-between">
                <span>{service.name}</span>
                <span>+{formatVnd(service.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-baseline justify-between pt-4">
        <p className="text-sm font-semibold text-foreground">Tổng tiền</p>
        <p className="font-display text-2xl font-extrabold text-mv-journey-blue">{formatVnd(priceSummary.grandTotal)}</p>
      </div>
    </div>
  )
}
