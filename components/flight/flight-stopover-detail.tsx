import { Clock3 } from 'lucide-react'

/** Layover divider between two segments (EPIC-003 §4.2). */
export function FlightStopoverDetail({ airportCode, durationMinutes }: { airportCode: string; durationMinutes: number }) {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  const label = minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`

  return (
    <div className="ml-[5px] flex items-center gap-2 border-l-2 border-dashed border-mv-mice-gold py-2 pl-[19px] text-xs font-medium text-mv-limited-text">
      <Clock3 className="size-3.5 shrink-0" aria-hidden />
      Dừng tại {airportCode} · {label}
    </div>
  )
}
