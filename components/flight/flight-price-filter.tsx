import { formatVnd } from '@/lib/flight/flight-format'

/** Single "up to X" range slider (EPIC-002 §3 Khoảng giá) — a dual-thumb range needs a dedicated slider primitive this codebase doesn't have yet; a max-price ceiling covers the same filtering need without adding one. */
export function FlightPriceFilter({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Khoảng giá</p>
        <p className="text-xs font-medium text-mv-journey-blue">Tối đa {formatVnd(value)}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={Math.max(10_000, Math.round((max - min) / 100))}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Giá tối đa"
        className="w-full accent-mv-journey-blue"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{formatVnd(min)}</span>
        <span>{formatVnd(max)}</span>
      </div>
    </div>
  )
}
