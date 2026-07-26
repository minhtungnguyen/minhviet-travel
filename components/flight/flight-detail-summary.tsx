import { Plane } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatStopsLabel } from '@/lib/flight/flight-format'
import type { FlightDetail } from '@/types/flight'

const CABIN_LABELS: Record<string, string> = {
  economy: 'Phổ thông',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia',
  first: 'Hạng nhất',
}

/** Flight Summary (EPIC-003 §4.1) — same airline-monogram identity used on the Search Results Flight Card. */
export function FlightDetailSummary({ detail }: { detail: FlightDetail }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="bg-gradient-mv-brand grid size-14 shrink-0 place-items-center rounded-2xl font-display text-base font-bold text-white">
        {detail.airlineCode}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold text-foreground">{detail.airlineName}</p>
        <p className="text-sm text-muted-foreground">
          {detail.flightNumber} · {detail.aircraft}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{CABIN_LABELS[detail.cabinClass]}</Badge>
        <Badge variant={detail.stops === 0 ? 'success' : 'neutral'}>
          <Plane className="size-3 shrink-0 rotate-90" aria-hidden />
          {formatStopsLabel(detail.stops)}
        </Badge>
      </div>
    </div>
  )
}
