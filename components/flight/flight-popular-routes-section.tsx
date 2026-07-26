import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { FlightPopularRouteCard } from '@/components/flight/flight-popular-route-card'
import type { FlightPopularRoute } from '@/types/flight'

export function FlightPopularRoutesSection({ routes }: { routes: FlightPopularRoute[] }) {
  const activeRoutes = routes.filter((route) => route.isActive)

  return (
    <section className="section-py-md border-t border-border bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader eyebrow="Chặng bay phổ biến" title="Những chặng bay được đặt nhiều nhất" className="max-w-2xl" />

        {activeRoutes.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Hiện chưa có dữ liệu chặng bay.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeRoutes.map((route) => (
              <Reveal key={route.id}>
                <FlightPopularRouteCard
                  origin={route.origin}
                  destination={route.destination}
                  priceFrom={route.priceFrom}
                  currency={route.currency}
                  popularAirlines={route.popularAirlines}
                  href={route.href}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
