import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { Button } from '@/components/ui/button'
import { VerifiedStat } from '@/components/homepage/verified-stat'
import { Reveal } from '@/components/homepage/reveal'

/**
 * Kept prominent, early in the page — Corporate Excellence remains the
 * #1 priority persona per Volume 01 Ch.8, even with AI/consumer content
 * elsewhere on the page.
 */
export async function EnterpriseMiceSection() {
  const { enterpriseMice } = await getHomepageContent()

  return (
    <section className="section-py-md border-t border-mv-border-soft bg-background">
      <div className="container-mv">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
            {/* Background layer: absolutely filled behind the content, never
                dictates section height — the content column below does.
                This is what guarantees the badge/CTA safe area can never be
                clipped, regardless of how tall the copy gets at a given
                viewport width. */}
            <div className="absolute inset-0">
              <Image
                src={enterpriseMice.image.src}
                alt={enterpriseMice.image.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              {/* Sprint UI-02: navy-blue tinted overlay (Brand Blue tail)
                  instead of a flat near-black fade — keeps this as the
                  section's one deliberately dark, formal surface without
                  reading as pure black. */}
              <div className="absolute inset-0 bg-gradient-mv-mice" />
            </div>

            {/* Content column: min-h matches the prior visual height as a
                floor, but the column is in normal flow so it grows (and the
                background above grows with it via inset-0) instead of
                clipping when copy exceeds that floor. pt/pb are the
                dedicated top/bottom safe-area — always honored exactly,
                px stays in sync with the rest of the Hero's left safe area. */}
            <div className="relative flex min-h-[480px] items-center lg:min-h-[520px]">
              <div className="max-w-xl px-8 pb-12 pt-8 sm:px-12 sm:pb-14 sm:pt-9 lg:px-16 lg:pb-16 lg:pt-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-mv-sky-cyan/15 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-mv-sky-cyan">
                  <Sparkles className="size-3.5 text-mv-mice-gold" />
                  {enterpriseMice.badge}
                </span>
                <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
                  {enterpriseMice.title}
                </h2>
                <p className="mt-3 max-w-md text-pretty leading-relaxed text-paper/78">
                  {enterpriseMice.description}
                </p>

                <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-paper/70 border-t border-paper/25 pt-5">
                  {enterpriseMice.story}
                </p>

                <p className="mt-4 max-w-md text-pretty text-[11px] font-semibold uppercase tracking-wide text-mv-sky-cyan/80">
                  {enterpriseMice.process.join(' · ')}
                </p>

                <div className="mt-5">
                  <VerifiedStat stat={enterpriseMice.proofStat} onDark />
                </div>

                <Button variant="journey" size="lg" className="mt-6" render={<Link href={enterpriseMice.cta.href} />}>
                  {enterpriseMice.cta.label} <ArrowUpRight className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
