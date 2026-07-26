import { Badge } from '@/components/ui/badge'
import { formatClockTime, formatVnd } from '@/lib/flight/flight-format'
import type { FareOption, FlightDetail } from '@/types/flight'

/** Flight Summary (EPIC-004 §4) — trip/time/airline plus the fare tier price/uses carried from Flight Detail. */
export function FlightBookingSummaryCard({ detail, fareOption }: { detail: FlightDetail; fareOption: FareOption }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="bg-gradient-mv-brand grid size-12 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white">
        {detail.airlineCode}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-bold text-foreground">
          {detail.origin.city} ({detail.origin.code}) → {detail.destination.city} ({detail.destination.code})
        </p>
        <p className="text-sm text-muted-foreground">
          {formatClockTime(detail.segments[0].departTime)} – {formatClockTime(detail.segments.at(-1)!.arriveTime)} ·{' '}
          {detail.airlineName} {detail.flightNumber}
        </p>
      </div>
      <div className="text-right">
        <Badge variant="accent" className="mb-1">
          {fareOption.name}
        </Badge>
        <p className="font-display text-lg font-extrabold text-mv-journey-blue">{formatVnd(fareOption.totalPrice)}</p>
        <p className="text-[11px] text-muted-foreground">Giá / khách</p>
      </div>
    </div>
  )
}
