import type { FlightAirline } from '@/types/flight'

/**
 * Airline identity is rendered as a code monogram, not a fabricated
 * logo image — no licensed airline logo artwork exists in `/public`, and
 * inventing logo marks for real, trademarked carriers isn't appropriate
 * placeholder content. Swap for real, licensed logo assets when available.
 */
export function FlightAirlineCard({ airline }: { airline: FlightAirline }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:shadow-soft-lg">
      <span className="bg-gradient-mv-brand grid size-16 place-items-center rounded-2xl font-display text-lg font-bold text-white">
        {airline.code}
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-foreground">{airline.name}</p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {airline.isInternational ? 'Nội địa & quốc tế' : 'Nội địa'}
        </p>
      </div>
    </div>
  )
}
