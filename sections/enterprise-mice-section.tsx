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
    <section className="section-py-md bg-background">
      <div className="container-mv">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl shadow-soft-lg">
            <div className="relative min-h-[480px] w-full lg:min-h-[520px]">
              <Image
                src={enterpriseMice.image.src}
                alt={enterpriseMice.image.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/85 to-deep/40" />
            </div>

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl p-8 sm:p-12 lg:p-16">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
                  <Sparkles className="size-3.5" />
                  {enterpriseMice.badge}
                </span>
                <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
                  {enterpriseMice.title}
                </h2>
                <p className="mt-3 max-w-md text-pretty leading-relaxed text-paper/75">
                  {enterpriseMice.description}
                </p>

                <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-paper/70 border-t border-paper/25 pt-4">
                  {enterpriseMice.story}
                </p>

                <p className="mt-3 max-w-md text-pretty text-[11px] font-semibold uppercase tracking-wide text-paper/55">
                  {enterpriseMice.process.join(' · ')}
                </p>

                <div className="mt-5">
                  <VerifiedStat stat={enterpriseMice.proofStat} onDark />
                </div>

                <Button variant="accent" size="lg" className="mt-5" render={<Link href={enterpriseMice.cta.href} />}>
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
