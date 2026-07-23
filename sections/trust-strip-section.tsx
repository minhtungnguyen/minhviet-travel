import { getHomepageContent } from '@/lib/cms/client'
import { VerifiedStat } from '@/components/homepage/verified-stat'
import { LogoGrid } from '@/components/homepage/logo-grid'
import { SEGMENT_ICONS } from '@/components/homepage/icon-map'
import { Reveal } from '@/components/homepage/reveal'

/**
 * Consolidates what used to be three separate, redundant sections
 * (EnterpriseTrustBar, WhyChoose, Partners) into one module — the
 * audit's "Redundant Components" finding. Every stat carries its
 * source/asOf citation via `VerifiedStat`.
 */
export async function TrustStripSection() {
  const { trustStrip } = await getHomepageContent()

  return (
    <section className="border-b border-border bg-paper py-16 lg:py-20">
      <div className="container-mv">
        <Reveal>
          <div className="max-w-3xl border-b border-border pb-8">
            <h2 className="text-balance font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
              {trustStrip.positioning.headline}
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {trustStrip.positioning.description}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="eyebrow text-[11px] font-semibold text-primary">{trustStrip.eyebrow}</p>
            <ul className="flex flex-wrap gap-2.5">
              {trustStrip.segments.map((segment) => {
                const Icon = SEGMENT_ICONS[segment.icon]
                return (
                  <li
                    key={segment.id}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background px-3.5 py-1.5 text-xs font-semibold text-primary"
                  >
                    <Icon className="size-3.5 text-royal" strokeWidth={1.75} />
                    {segment.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
          {trustStrip.stats.map((stat) => (
            <VerifiedStat key={stat.id} stat={stat} />
          ))}
        </div>

        <Reveal className="mt-10 border-t border-border pt-8">
          <LogoGrid partners={trustStrip.partners} />
        </Reveal>
      </div>
    </section>
  )
}
