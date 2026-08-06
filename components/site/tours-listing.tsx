'use client'

import { useState } from 'react'
import type { PublicTourCard } from '@/lib/tours/public-tours'
import { MVButton } from '@/components/mv/mv-button'
import { TourCard } from '@/components/site/tour-card'
import { cn } from '@/lib/utils'

const ALL_FILTER = 'Tất cả'

export function ToursListing({ tours, categoryNames }: { tours: PublicTourCard[]; categoryNames: string[] }) {
  const [filter, setFilter] = useState(ALL_FILTER)
  const filters = [ALL_FILTER, ...categoryNames]

  const filtered = filter === ALL_FILTER ? tours : tours.filter((t) => t.categoryNames.includes(filter))

  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="container-mv">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
          <div className="flex flex-wrap gap-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'relative pb-1 text-sm font-semibold transition-colors',
                  filter === f ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
                {filter === f && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} hành trình</p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
            <p className="font-display text-xl text-foreground">Chưa có tour phù hợp</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng chọn khu vực khác hoặc để lại yêu cầu để được tư vấn riêng.
            </p>
            <MVButton href="/contact" variant="outline" size="md" className="mt-6">
              Yêu cầu tư vấn
            </MVButton>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tour) => (
              <TourCard key={tour.pageId} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
