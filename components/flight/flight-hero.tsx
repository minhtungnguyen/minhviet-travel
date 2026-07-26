import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { FlightSearchBox } from '@/components/flight/flight-search-box'
import type { FlightHomeContent } from '@/types/flight'

/**
 * Custom hero (not `PageHero`) — mirrors `MiceHero`'s pattern (breadcrumb +
 * eyebrow + headline over a full-bleed image) but replaces the CTA pair
 * with the Flight Search Box itself, since search is this page's single
 * conversion action (EPIC-001 §3.2).
 */
export function FlightHero({
  hero,
  searchBox,
}: {
  hero: FlightHomeContent['hero']
  searchBox: FlightHomeContent['searchBox']
}) {
  return (
    <section className="relative overflow-hidden bg-mv-deep-navy">
      <div className="absolute inset-0">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mv-deep-navy/93 via-mv-deep-navy/72 to-mv-deep-navy/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy via-transparent to-mv-deep-navy/30" />
      </div>

      <div className="container-mv relative flex flex-col justify-center pt-32 pb-14 sm:pt-40 lg:pt-48 lg:pb-20">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/55" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-white/90">Vé máy bay</span>
        </nav>

        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-sky-cyan">
            <span className="h-px w-10 bg-mv-sky-cyan/50" />
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.14] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            {hero.headline}
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/85">{hero.supportingCopy}</p>
        </div>

        <div className="relative z-10 mt-10 lg:mt-12">
          <FlightSearchBox
            airports={searchBox.airports}
            cabinClasses={searchBox.cabinClasses}
            defaultOriginCode={searchBox.defaultOriginCode}
            defaultDestinationCode={searchBox.defaultDestinationCode}
          />
        </div>
      </div>
    </section>
  )
}
