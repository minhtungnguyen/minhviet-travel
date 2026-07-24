import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ArrowUpRight } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import type { MiceLandingContent } from '@/types/mice'

/**
 * Custom hero (not `PageHero`) — this is a conversion landing page, so it
 * keeps the same "no more than 3 visual accents" discipline as
 * `CustomTourHero`: eyebrow, headline, one CTA pair. The breadcrumb is
 * the one addition `PageHero` already has and the brief explicitly asks
 * for here (§XIX) — normal-flow content column, image as `absolute
 * inset-0` behind it, never a fixed-height box copy can be clipped by.
 */
export function MiceHero({ hero }: { hero: MiceLandingContent['hero'] }) {
  return (
    <section className="relative overflow-hidden bg-deep">
      <div className="absolute inset-0">
        <Image src={hero.image.src} alt={hero.image.alt} fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/92 via-deep/70 to-deep/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-deep/40" />
      </div>

      <div className="container-mv relative flex flex-col justify-center pt-36 pb-14 sm:pt-48 lg:min-h-[680px] lg:pt-56 lg:pb-20">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-paper/55" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-paper">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-paper/70">Sự kiện & MICE</span>
          <ChevronRight className="size-3.5" />
          <span className="text-paper/90">MICE</span>
        </nav>

        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-sky-cyan">
            <span className="h-px w-10 bg-mv-sky-cyan/50" />
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.14] tracking-tight whitespace-pre-line text-paper sm:text-5xl lg:text-[3.25rem]">
            {hero.headline}
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper/85">{hero.supportingCopy}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MVButton href={hero.primaryCta.href} variant="gold" size="lg">
              {hero.primaryCta.label} <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href={hero.secondaryCta.href} variant="outline-light" size="lg">
              {hero.secondaryCta.label}
            </MVButton>
          </div>
        </div>
      </div>
    </section>
  )
}
