'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Play } from 'lucide-react'
import type { TravelInspirationItem } from '@/types/inspiration'
import { VideoModal } from '@/components/homepage/video-modal'

export function FeaturedInspirationVideo({ item }: { item: TravelInspirationItem }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl shadow-soft-lg">
        <div className="relative aspect-video w-full">
          <Image
            src={item.coverImage.src}
            alt={item.coverImageAlt}
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.02]"
          />
          {/* Navy-blue overlay, not pure black — consistent with the MICE/Hero treatment */}
          <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/92 via-mv-deep-navy/35 to-mv-deep-navy/10" />

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label={`Phát video: ${item.title}`}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white/90 text-mv-deep-navy shadow-soft-lg transition-colors duration-mv-fast group-hover:bg-white sm:size-20">
              <Play className="size-6 translate-x-0.5 fill-current sm:size-7" strokeWidth={1} />
            </span>
          </button>

          {item.videoDuration && (
            <span className="absolute right-4 top-4 rounded-full bg-mv-deep-navy/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {item.videoDuration}
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="eyebrow text-[11px] font-semibold text-mv-sky-cyan">{item.category}</p>
            <h2 className="mt-2 max-w-lg text-balance font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-white/78 sm:text-base">
                {item.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={item.ctaUrl}
          className="group/cta inline-flex items-center gap-1.5 text-sm font-semibold text-mv-journey-blue transition-colors duration-mv-fast hover:text-mv-sky-cyan"
        >
          {item.ctaLabel}
          <ArrowUpRight className="size-4 transition-transform duration-mv-fast group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
        </Link>
      </div>

      <VideoModal item={item} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
