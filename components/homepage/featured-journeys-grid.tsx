'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { JourneyCard } from '@/components/homepage/journey-card'
import { cn } from '@/lib/utils'
import type { FeaturedJourneysContent } from '@/types/homepage'

export function FeaturedJourneysGrid({ content }: { content: FeaturedJourneysContent }) {
  const [filter, setFilter] = useState<(typeof content.filters)[number]['id']>('all')

  const filtered =
    filter === 'all' ? content.journeys : content.journeys.filter((j) => j.category === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-6">
        {content.filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'relative pb-1 text-sm font-semibold transition-colors',
              filter === f.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={filter === f.id}
          >
            {f.label}
            {filter === f.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
          <p className="font-display text-xl text-foreground">Chưa có hành trình phù hợp</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng chọn khu vực khác hoặc để lại yêu cầu để được tư vấn riêng.
          </p>
          <Button size="lg" className="mt-6" render={<a href="#lead-form" />}>
            Liên hệ chuyên gia
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </div>
  )
}
