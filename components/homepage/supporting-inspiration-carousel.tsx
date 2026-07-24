'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { InspirationCard } from '@/components/homepage/inspiration-card'
import type { TravelInspirationItem } from '@/types/inspiration'

/**
 * Fixes the "3rd card peeking" defect: exactly 2 cards fill the visible
 * track at `sm:` and up (each item is `calc(50% - half the gap)` wide),
 * 1 full card on mobile. Anything beyond what fits is scrolled fully
 * off-screen, never partially visible at rest — `snap-mandatory` always
 * settles on a card boundary. Desktop pages by 1 card via the arrow
 * buttons (measured from the real rendered card width, not a hardcoded
 * pixel guess); mobile relies on native touch swipe, no buttons shown.
 */
export function SupportingInspirationCarousel({ items }: { items: TravelInspirationItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const updateEdges = () => {
    const track = trackRef.current
    if (!track) return
    setAtStart(track.scrollLeft <= 1)
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1)
  }

  useEffect(() => {
    updateEdges()
  }, [items.length])

  const scrollByOneCard = (dir: 1 | -1) => {
    const track = trackRef.current
    const cardWidth = firstItemRef.current?.getBoundingClientRect().width ?? 0
    const gap = 16 // matches gap-4 below
    track?.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' })
  }

  if (items.length === 0) return null

  const canNavigate = items.length > 2

  return (
    <div>
      {canNavigate && (
        <div className="mb-3 hidden justify-end gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByOneCard(-1)}
            disabled={atStart}
            aria-label="Xem nội dung trước"
            className="grid size-10 place-items-center rounded-full border border-mv-border-soft bg-mv-ice-blue text-mv-deep-navy transition-colors duration-mv-fast hover:border-mv-journey-blue hover:bg-mv-journey-blue hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByOneCard(1)}
            disabled={atEnd}
            aria-label="Xem nội dung tiếp theo"
            className="grid size-10 place-items-center rounded-full border border-mv-border-soft bg-mv-ice-blue text-mv-deep-navy transition-colors duration-mv-fast hover:border-mv-journey-blue hover:bg-mv-journey-blue hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={index === 0 ? firstItemRef : undefined}
            className="w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)]"
          >
            <InspirationCard item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
