'use client'

import { cn } from '@/lib/utils'
import type { FlightTripType } from '@/types/flight'

const options: { value: FlightTripType; label: string }[] = [
  { value: 'oneway', label: 'Một chiều' },
  { value: 'roundtrip', label: 'Khứ hồi' },
]

export function FlightTripTypeTabs({
  value,
  onChange,
}: {
  value: FlightTripType
  onChange: (value: FlightTripType) => void
}) {
  return (
    <div role="tablist" aria-label="Loại hành trình" className="inline-flex items-center gap-1 rounded-full bg-secondary p-1">
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-mv-fast outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              isActive ? 'bg-card text-mv-journey-blue shadow-soft' : 'text-foreground/60 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
