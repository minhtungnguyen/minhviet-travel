import { FlightBookingPassengerForm } from '@/components/flight/flight-booking-passenger-form'
import type { BookingPassenger } from '@/types/flight'

const TYPE_LABELS: Record<BookingPassenger['type'], string> = {
  adult: 'Người lớn',
  child: 'Trẻ em',
  infant: 'Em bé',
}

/** Passenger List (EPIC-004 §4) — one `FlightBookingPassengerForm` per seat, labeled "Người lớn 1", "Trẻ em 1", etc. within each type. */
export function FlightBookingPassengerList({
  passengers,
  onChange,
  errors,
}: {
  passengers: BookingPassenger[]
  onChange: (next: BookingPassenger[]) => void
  errors?: Record<string, Partial<Record<keyof BookingPassenger, string>>>
}) {
  const seenCountByType: Record<BookingPassenger['type'], number> = { adult: 0, child: 0, infant: 0 }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-base font-bold text-foreground">Danh sách hành khách</p>
      {passengers.map((passenger) => {
        seenCountByType[passenger.type] += 1
        const label = `${TYPE_LABELS[passenger.type]} ${seenCountByType[passenger.type]}`

        return (
          <FlightBookingPassengerForm
            key={passenger.id}
            passenger={passenger}
            label={label}
            errors={errors?.[passenger.id]}
            onChange={(next) => onChange(passengers.map((p) => (p.id === next.id ? next : p)))}
          />
        )
      })}
    </div>
  )
}
