import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { FlightAirlineCard } from '@/components/flight/flight-airline-card'
import type { FlightAirline } from '@/types/flight'

export function FlightAirlinesSection({ airlines }: { airlines: FlightAirline[] }) {
  const activeAirlines = airlines.filter((a) => a.isActive).sort((a, b) => a.order - b.order)

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader eyebrow="Đối tác hàng không" title="Bay cùng các hãng hàng không uy tín" className="max-w-2xl" />

        {activeAirlines.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Thông tin hãng bay đang được cập nhật.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {activeAirlines.map((airline) => (
              <Reveal key={airline.id}>
                <FlightAirlineCard airline={airline} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
