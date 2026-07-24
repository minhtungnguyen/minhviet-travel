'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceMediaItem } from '@/types/mice'

/**
 * No real aftermovie footage exists yet (brief §XIV) — clicking Play must
 * never embed an unrelated stock video. It shows an honest "coming soon"
 * state instead. No autoplay, no preload; the cover is a static
 * `next/image`, not a `<video>` element, so there's zero video weight
 * until real footage is ready to swap in.
 */
function MediaTile({ item }: { item: MiceMediaItem }) {
  const [clicked, setClicked] = useState(false)

  return (
    <div className="group relative aspect-video overflow-hidden rounded-2xl bg-mv-deep-navy">
      {item.coverImage && (
        <Image
          src={item.coverImage}
          alt={item.coverImageAlt ?? item.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover opacity-90"
        />
      )}
      <div className="absolute inset-0 bg-mv-deep-navy/30" />

      {clicked ? (
        <div className="absolute inset-0 flex items-center justify-center bg-mv-deep-navy/80 p-4 text-center">
          <p className="text-sm font-semibold text-white">Video đang được cập nhật</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setClicked(true)}
          aria-label={`Xem video: ${item.title}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-mv-deep-navy shadow-soft-lg transition-transform group-hover:scale-105">
            <Play className="size-6 fill-current" />
          </span>
        </button>
      )}

      <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">{item.title}</p>
    </div>
  )
}

export function MiceMediaSection({ items }: { items: MiceMediaItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader eyebrow="Cảm xúc chương trình" title="Cảm xúc sau mỗi chương trình" className="max-w-2xl" />

        <Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MediaTile key={item.id} item={item} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
