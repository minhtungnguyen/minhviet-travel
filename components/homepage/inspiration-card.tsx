import Link from 'next/link'
import Image from 'next/image'
import type { TravelInspirationItem } from '@/types/inspiration'

export function InspirationCard({ item }: { item: TravelInspirationItem }) {
  return (
    <Link
      href={item.ctaUrl}
      className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-mv-border-soft bg-white shadow-soft transition-all duration-mv-normal ease-mv-standard hover:-translate-y-0.5 hover:border-mv-sky-cyan hover:shadow-soft-lg sm:w-[260px]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={item.coverImage.src}
          alt={item.coverImageAlt}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow text-[10px] font-semibold text-mv-journey-blue">{item.category}</p>
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-mv-deep-navy">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-mv-slate">{item.excerpt}</p>
        <span className="mt-auto pt-2 text-xs font-semibold text-mv-journey-blue group-hover:text-mv-sky-cyan">
          {item.ctaLabel} →
        </span>
      </div>
    </Link>
  )
}
