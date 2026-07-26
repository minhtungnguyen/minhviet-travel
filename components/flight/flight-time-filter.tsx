import { TIME_BUCKET_LABELS, type FlightTimeBucket } from '@/lib/flight/flight-search-filters'
import { cn } from '@/lib/utils'

/** Time-of-day bucket filter — reused for both "Giờ cất cánh" and "Giờ hạ cánh" (EPIC-002 §3), one component instead of two near-identical ones. */
export function FlightTimeFilter({
  label,
  selected,
  onChange,
}: {
  label: string
  selected: FlightTimeBucket[]
  onChange: (next: FlightTimeBucket[]) => void
}) {
  const buckets = Object.keys(TIME_BUCKET_LABELS) as FlightTimeBucket[]

  function toggle(bucket: FlightTimeBucket) {
    onChange(selected.includes(bucket) ? selected.filter((b) => b !== bucket) : [...selected, bucket])
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {buckets.map((bucket) => {
          const active = selected.includes(bucket)
          return (
            <button
              key={bucket}
              type="button"
              onClick={() => toggle(bucket)}
              aria-pressed={active}
              className={cn(
                'rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors',
                active ? 'border-mv-journey-blue bg-mv-journey-blue/10 text-mv-journey-blue' : 'border-border text-muted-foreground hover:border-foreground/30',
              )}
            >
              {TIME_BUCKET_LABELS[bucket]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
