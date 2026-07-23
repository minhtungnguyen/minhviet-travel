'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DestinationCard } from '@/components/homepage/destination-card'
import type { DestinationContent } from '@/types/homepage'

export function DestinationsRail({ destinations }: { destinations: DestinationContent[] }) {
  const scroller = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="hidden justify-end gap-2 sm:flex">
        <button
          onClick={() => scrollBy(-1)}
          className="grid size-12 place-items-center rounded-full border border-foreground/25 text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          aria-label="Cuộn trái"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="grid size-12 place-items-center rounded-full border border-foreground/25 text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          aria-label="Cuộn phải"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div
        ref={scroller}
        className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {destinations.map((destination) => (
          <div key={destination.id} className="shrink-0">
            <DestinationCard destination={destination} />
          </div>
        ))}
      </div>
    </div>
  )
}
