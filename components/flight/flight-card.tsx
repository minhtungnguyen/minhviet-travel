import { Badge } from '@/components/ui/badge'
import { MVButton } from '@/components/mv/mv-button'
import { buildFlightDetailPath } from '@/lib/flight/flight-detail-id'
import { formatClockTime, formatDuration, formatStopsLabel, formatVnd } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'
import type { FlightOffer, FlightSearchQuery } from '@/types/flight'

const CABIN_LABELS: Record<string, string> = {
  economy: 'Phổ thông',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia',
  first: 'Hạng nhất',
}

/**
 * One bookable fare (EPIC-002 §3 Flight Card). "Chọn" links to Flight
 * Detail (EPIC-003, `/ve-may-bay/chi-tiet/[flightId]`) via
 * `buildFlightDetailPath`, carrying `query`'s cabin/passenger context —
 * the seeded generator needs it to regenerate this exact offer (see
 * `lib/flight/flight-detail-id.ts`).
 */
export function FlightCard({ offer, query }: { offer: FlightOffer; query: FlightSearchQuery }) {
  return (
    <article className="rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:w-40">
          <span className="bg-gradient-mv-brand grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white">
            {offer.airlineCode}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{offer.airlineName}</p>
            <p className="text-xs text-muted-foreground">{offer.flightNumber}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">{formatClockTime(offer.departTime)}</p>
            <p className="text-xs text-muted-foreground">{offer.originCode}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-2">
            <p className="text-xs text-muted-foreground">{formatDuration(offer.durationMinutes)}</p>
            <div className="my-1 h-px w-full bg-border" />
            <p className={cn('text-xs', offer.stops === 0 ? 'text-success' : 'text-muted-foreground')}>
              {formatStopsLabel(offer.stops)}
            </p>
          </div>

          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">{formatClockTime(offer.arriveTime)}</p>
            <p className="text-xs text-muted-foreground">{offer.destinationCode}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:w-48 sm:flex-col sm:items-end">
          <div className="text-right">
            {offer.isRecommended && (
              <Badge variant="accent" className="mb-1">
                Khuyến nghị
              </Badge>
            )}
            <p className="font-display text-xl font-extrabold text-mv-journey-blue">{formatVnd(offer.price)}</p>
            <p className="text-[11px] text-muted-foreground">Tổng giá / {CABIN_LABELS[offer.cabinClass]}</p>
          </div>
          <MVButton
            href={buildFlightDetailPath(offer.id, {
              cabinClass: query.cabinClass,
              adults: query.adults,
              children: query.children,
              infants: query.infants,
            })}
            variant="accent"
            size="sm"
          >
            Chọn
          </MVButton>
        </div>
      </div>
    </article>
  )
}
