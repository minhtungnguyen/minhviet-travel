import Link from 'next/link'
import Image from 'next/image'
import type { TravelInspirationItem } from '@/types/inspiration'

/**
 * Sizing/shrink/snap-start intentionally live on the wrapper the
 * carousel puts around this (see `SupportingInspirationCarousel`), not
 * here — this component only has to fill whatever box it's given
 * (`h-full`) so every card in a row stretches to the same height
 * regardless of title/excerpt line count.
 */
export function InspirationCard({ item }: { item: TravelInspirationItem }) {
  return (
    <Link
      href={item.ctaUrl}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mv-border-soft bg-white shadow-soft transition-all duration-mv-normal ease-mv-standard hover:-translate-y-0.5 hover:border-mv-sky-cyan hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <Image
          src={item.coverImage.src}
          alt={item.coverImageAlt}
          fill
          sizes="(min-width: 640px) 27vw, 90vw"
          className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow text-[10px] font-semibold text-mv-journey-blue">{item.category}</p>
        {/* min-h pinned to exactly 2 lines at each element's own line-height
            (leading-snug=1.375, leading-relaxed=1.625) so title/excerpt
            reserve identical space across cards even when the real text
            is short enough to wrap to only 1 line. */}
        <h3 className="line-clamp-2 min-h-[2.75em] font-display text-base font-bold leading-snug text-mv-deep-navy">
          {item.title}
        </h3>
        <p className="line-clamp-2 min-h-[3.25em] text-xs leading-relaxed text-mv-slate">{item.excerpt}</p>
        <span className="mt-auto pt-2 text-xs font-semibold text-mv-journey-blue group-hover:text-mv-sky-cyan">
          {item.ctaLabel} →
        </span>
      </div>
    </Link>
  )
}
