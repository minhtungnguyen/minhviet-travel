import { FlightAirportPoint } from '@/components/flight/flight-airport-point'
import { FlightStopoverDetail } from '@/components/flight/flight-stopover-detail'
import { formatDuration } from '@/lib/flight/flight-format'
import type { FlightAirport, FlightLayover, FlightSegment } from '@/types/flight'

/**
 * Route Timeline (EPIC-003 §4.2) — alternates `FlightAirportPoint` (depart/arrive)
 * with `FlightStopoverDetail` between segments. `origin`/`destination` carry
 * full city/airport names (already resolved `FlightAirport` objects);
 * intermediate stop points only ever have a code, matching what a layover
 * airport is in this mock model.
 */
export function FlightRouteTimeline({
  segments,
  layovers,
  origin,
  destination,
  totalDurationMinutes,
}: {
  segments: FlightSegment[]
  layovers: FlightLayover[]
  origin: FlightAirport
  destination: FlightAirport
  totalDurationMinutes: number
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="font-semibold text-foreground">Hành trình chi tiết</p>
        <p className="text-muted-foreground">Tổng thời gian: {formatDuration(totalDurationMinutes)}</p>
      </div>

      <div className="flex flex-col gap-1">
        {segments.map((segment, index) => (
          <div key={`${segment.flightNumber}-${index}`}>
            <FlightAirportPoint
              kind="depart"
              code={segment.originCode}
              city={index === 0 ? origin.city : undefined}
              airportName={index === 0 ? origin.name : undefined}
              time={segment.departTime}
            />
            <div className="ml-[5px] border-l-2 border-border py-2 pl-[19px] text-xs text-muted-foreground">
              {segment.airlineName} {segment.flightNumber} · {segment.aircraft} · {formatDuration(segment.durationMinutes)}
            </div>
            <FlightAirportPoint
              kind="arrive"
              code={segment.destinationCode}
              city={index === segments.length - 1 ? destination.city : undefined}
              airportName={index === segments.length - 1 ? destination.name : undefined}
              time={segment.arriveTime}
            />
            {layovers[index] && <FlightStopoverDetail airportCode={layovers[index].airportCode} durationMinutes={layovers[index].durationMinutes} />}
          </div>
        ))}
      </div>
    </div>
  )
}
