import { SORT_LABELS, type FlightSortKey } from '@/lib/flight/flight-search-filters'
import { cn } from '@/lib/utils'

const ORDER: FlightSortKey[] = ['recommended', 'price', 'departure', 'duration']

export function FlightSortBar({
  value,
  onChange,
  resultCount,
}: {
  value: FlightSortKey
  onChange: (value: FlightSortKey) => void
  resultCount: number
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> chuyến bay phù hợp
      </p>
      <div role="tablist" aria-label="Sắp xếp" className="flex flex-wrap gap-1.5">
        {ORDER.map((key) => {
          const active = key === value
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                active ? 'bg-mv-journey-blue text-white' : 'bg-secondary text-foreground/70 hover:text-foreground',
              )}
            >
              {SORT_LABELS[key]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
