import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { Button } from '@/components/ui/button'
import { VerifiedStat } from '@/components/homepage/verified-stat'
import { SmartSearchBar } from '@/components/homepage/smart-search-bar'

/**
 * Everything needed to establish trust within the first viewport lives
 * here: identity, one sourced proof point, and a working search/AI
 * entry — no scrolling required (Goal: trust in under 5 seconds).
 */
export async function HeroSection() {
  const { hero } = await getHomepageContent()

  return (
    <section className="relative overflow-hidden bg-deep">
      <div className="absolute inset-0">
        <Image
          src={hero.backgroundImage.src}
          alt={hero.backgroundImage.alt}
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,22,43,0.84)_0%,rgba(7,22,43,0.62)_42%,rgba(7,22,43,0.24)_72%,rgba(7,22,43,0.08)_100%)]" />
      </div>

      <div className="container-mv relative flex flex-col justify-center pt-28 pb-14 sm:pt-32 lg:min-h-[760px] lg:pt-40 lg:pb-20">
        <div className="max-w-[720px]">
          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-gold">
            <span className="h-px w-10 bg-gold/50" />
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 text-balance font-display text-3xl font-extrabold leading-[1.18] tracking-tight text-paper sm:text-4xl lg:text-[3.25rem] xl:text-[3.75rem]">
            {hero.headline} <span className="text-gradient-gold">{hero.headlineAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-paper/75 sm:text-lg">
            {hero.subhead}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" render={<Link href={hero.primaryCta.href} />}>
              {hero.primaryCta.label} <ArrowUpRight className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white hover:text-deep"
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

      <div className="container-mv relative z-10 -mb-16 lg:-mb-14">
        <div className="pb-4">
          <SmartSearchBar />
        </div>
      </div>
    </section>
  )
}
