'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AttractionGalleryImage } from '@/modules/attraction-ticket/domain/types'

/**
 * Product Detail gallery (15-review-package-v1.md §5: "GALLERY — vuốt
 * ngang, đếm 1/N"). Horizontal scroll-snap track, same `onScroll` +
 * `scrollLeft/clientWidth` index-tracking pattern as
 * `components/homepage/supporting-inspiration-carousel.tsx` — no new
 * carousel dependency. Falls back to the single cover image when
 * `galleryImages` is empty (product detail page keeps rendering that image
 * directly in that case, this component is only mounted when there is
 * something to swipe through).
 */
export function AttractionGallery({ images, title }: { images: AttractionGalleryImage[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) return null

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)

  function updateActiveIndex() {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), sorted.length - 1))
  }

  function scrollToIndex(index: number) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateActiveIndex}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sorted.map((image, index) => (
          <div key={image.url} className="relative aspect-[16/10] w-full shrink-0 snap-start overflow-hidden">
            <Image
              src={image.url}
              alt={image.alt || title}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {sorted.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Ảnh trước"
            className="absolute left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-mv-deep-navy shadow-soft disabled:opacity-40 sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(sorted.length - 1, activeIndex + 1))}
            disabled={activeIndex === sorted.length - 1}
            aria-label="Ảnh tiếp theo"
            className="absolute right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-mv-deep-navy shadow-soft disabled:opacity-40 sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>

          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            {activeIndex + 1}/{sorted.length}
          </span>
        </>
      )}
    </div>
  )
}
