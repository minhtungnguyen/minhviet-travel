import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { InsuranceHeroContent } from '@/types/insurance'

/**
 * Light `mv-mist-blue` treatment, not Combo/MICE's dark full-bleed navy —
 * per BRAND-002 §Insurance ("Bảo vệ · Bình an · An toàn", "tông dịu nhất
 * hệ thống"). `Reveal`'s default motion already runs at `DURATION.slow`
 * (360ms, constants/motion.ts) — the brand's required "slow, êm, không
 * giật" tier for this module — so no custom variants override is needed
 * here.
 *
 * Hard brand rule: no hospital/accident imagery, no countdown/urgency
 * timer anywhere in this section (BRAND-002 explicitly names both as
 * forbidden for Insurance — conflicts with "peace of mind").
 */
export function InsuranceHero({ content }: { content: InsuranceHeroContent }) {
  /**
   * No real "family/individual in an ordinary safe travel moment" photo
   * (the brand-approved subject) has been sourced yet — reusing an
   * existing real Minh Việt destination photo as a placeholder rather
   * than fabricating or borrowing DBV's own marketing photography. Flip
   * to `false` the same commit a real photo is swapped in — same
   * discipline as `attraction-ticket-hero.tsx`'s own temporary-asset flag.
   */
  const isTemporaryAsset = true

  return (
    /**
     * `pt-28 lg:pt-48` clears `SiteHeader`'s `fixed inset-x-0 top-0` bar —
     * measured ~105px tall on mobile (no utility/nav rows below `lg`),
     * ~185px on desktop (utility bar + brand row + nav row all visible).
     * Every other hero in this codebase (`PageHero`, `AttractionTicketHero`)
     * carries the same kind of offset for the same reason — there is no
     * shared spacer in `SiteChrome`, each hero owns clearing the fixed
     * header itself (see `site-header.tsx`'s own header-height comment).
     */
    <section className="relative overflow-hidden bg-gradient-to-b from-mv-mist-blue to-background pb-16 pt-28 lg:pb-24 lg:pt-48">
      <nav className="container-mv mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-mv-journey-blue">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Bảo hiểm du lịch</span>
      </nav>

      <div className="container-mv grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          {content.eyebrow && (
            <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-journey-blue">
              <span className="h-px w-8 divider-mv-gradient" />
              {content.eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-balance font-display text-3xl font-bold leading-[1.15] tracking-tight text-mv-deep-navy sm:text-4xl lg:text-[2.75rem]">
            {content.headline}
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{content.subheadline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <MVButton href={content.primaryCta.href} variant="accent" size="lg">
              {content.primaryCta.label}
            </MVButton>
            <MVButton href={content.secondaryCta.href} variant="outline" size="lg">
              {content.secondaryCta.label}
            </MVButton>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {content.trustSignals.map((signal) => (
              <li key={signal} className="flex items-center gap-2 text-sm font-medium text-mv-deep-navy">
                <span className="size-1.5 shrink-0 rounded-full bg-mv-journey-blue" />
                {signal}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft-lg">
            <Image
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            {isTemporaryAsset && (
              <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Temporary Asset
              </span>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
