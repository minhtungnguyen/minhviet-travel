import { Check } from 'lucide-react'
import { formatVnd } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'
import type { BookingExtraService } from '@/types/flight'

/** One optional add-on (EPIC-004 §4 Extra Services). */
export function FlightBookingExtraServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: BookingExtraService
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        selected ? 'border-mv-journey-blue bg-mv-mist-blue/40' : 'border-border bg-card hover:border-mv-journey-blue/40',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border',
          selected ? 'border-mv-journey-blue bg-mv-journey-blue text-white' : 'border-border bg-background',
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{service.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{service.description}</p>
      </div>
      <p className="shrink-0 text-sm font-bold text-mv-journey-blue">+{formatVnd(service.price)}</p>
    </button>
  )
}
