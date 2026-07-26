import { formatClockTime } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'

/** One endpoint of a flight leg (EPIC-003 §4.2) — used for both the true origin/destination (full city/airport name available) and intermediate stop points (code only). */
export function FlightAirportPoint({
  kind,
  code,
  city,
  airportName,
  time,
}: {
  kind: 'depart' | 'arrive'
  code: string
  city?: string
  airportName?: string
  time: string
}) {
  const date = new Date(time)
  const dateLabel = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`

  return (
    <div className="flex items-start gap-4">
      <div className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', kind === 'depart' ? 'bg-mv-journey-blue' : 'bg-mv-deep-navy')} aria-hidden />
      <div className="min-w-0">
        <p className="font-display text-xl font-bold text-foreground">
          {formatClockTime(time)} <span className="text-sm font-medium text-muted-foreground">{dateLabel}</span>
        </p>
        <p className="text-sm font-semibold text-foreground">
          {city ? `${city} (${code})` : code}
        </p>
        {airportName && <p className="text-xs text-muted-foreground">{airportName}</p>}
      </div>
    </div>
  )
}
