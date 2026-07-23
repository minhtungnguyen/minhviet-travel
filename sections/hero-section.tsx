import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { Button } from '@/components/ui/button'
import { VerifiedStat } from '@/components/homepage/verified-stat'
import { HeroVideoRotator } from '@/components/homepage/hero-video-rotator'

/**
 * Everything needed to establish trust within the first viewport lives
 * here: identity, one sourced proof point, and the two paths the rest
 * of the page is organized around (bespoke design vs. ready-made tours)
 * — no scrolling required (Goal: trust in under 5 seconds).
 */
export async function HeroSection() {
  const { hero } = await getHomepageContent()

  return (
    <section className="relative overflow-hidden bg-deep">
      <div className="absolute inset-0">
        <HeroVideoRotator />
        {/* Rest of the site is white-dominant now — the hero is the one
            section allowed to stay a dark "stage" for the video, so the
            overlay only needs to be strong enough for text legibility. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,22,43,0.6)_0%,rgba(7,22,43,0.4)_42%,rgba(7,22,43,0.15)_72%,rgba(7,22,43,0.05)_100%)]" />
      </div>

      <div className="container-mv relative flex flex-col justify-center pt-28 pb-14 sm:pt-32 lg:min-h-[760px] lg:pt-40 lg:pb-20">
        <div className="max-w-[720px]">
          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-accent">
            <span className="h-px w-10 bg-accent/50" />
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 text-balance font-display text-3xl font-extrabold leading-[1.18] tracking-tight text-paper sm:text-4xl lg:text-[3.25rem] xl:text-[3.75rem]">
            {hero.headline} <span className="text-gradient-sky">{hero.headlineAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-paper/75 sm:text-lg">
            {hero.subhead}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="accent" size="lg" render={<Link href={hero.primaryCta.href} />}>
              {hero.primaryCta.label} <ArrowUpRight className="size-5" />
            </Button>
            <Button
              variant="outline-light"
              size="lg"
              render={<Link href={hero.secondaryCta.href} />}
            >
              {hero.secondaryCta.label}
            </Button>
          </div>

          <div className="mt-10 max-w-xs border-t border-paper/15 pt-6">
            <VerifiedStat stat={hero.proofStat} onDark />
          </div>
        </div>
      </div>
    </section>
  )
}
