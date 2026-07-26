import { cn } from '@/lib/utils'

export interface FlightAirlineFilterOption {
  code: string
  name: string
  count: number
}

/** Airline checkbox list (EPIC-002 §3 Hãng bay), scoped to airlines actually present in the current result set — checking every airline the platform knows about, most of which return 0 offers on this route, would be confusing filler. */
export function FlightAirlineFilter({
  options,
  selected,
  onChange,
}: {
  options: FlightAirlineFilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  function toggle(code: string) {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code])
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">Hãng bay</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const checked = selected.includes(option.code)
          return (
            <label key={option.code} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.code)}
                  className="size-4 rounded border-border accent-mv-journey-blue"
                />
                <span className={cn('text-foreground', checked && 'font-semibold')}>{option.name}</span>
              </span>
              <span className="text-xs text-muted-foreground">{option.count}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
