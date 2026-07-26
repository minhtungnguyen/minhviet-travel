import { formatVnd } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'
import type { FareOption } from '@/types/flight'

/** Quick tier switcher (EPIC-003 §4.3) — the full detail of whichever tab is active renders separately via `FlightFareOptionCard`. */
export function FlightFareOptionTabs({
  fareOptions,
  selectedId,
  onSelect,
}: {
  fareOptions: FareOption[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div role="tablist" aria-label="Hạng vé" className="flex gap-2 overflow-x-auto pb-1">
      {fareOptions.map((option) => {
        const active = option.id === selectedId
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(option.id)}
            className={cn(
              'flex shrink-0 flex-col items-start gap-0.5 rounded-xl border px-4 py-2.5 text-left transition-colors',
              active ? 'border-mv-journey-blue bg-mv-journey-blue text-white' : 'border-border bg-card text-foreground hover:border-mv-journey-blue/50',
            )}
          >
            <span className="text-xs font-semibold">{option.name}</span>
            <span className={cn('text-sm font-bold', active ? 'text-white' : 'text-mv-journey-blue')}>{formatVnd(option.totalPrice)}</span>
          </button>
        )
      })}
    </div>
  )
}
