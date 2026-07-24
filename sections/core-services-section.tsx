import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { SERVICE_ICONS } from '@/components/homepage/icon-map'
import { Reveal } from '@/components/homepage/reveal'
import { cn } from '@/lib/utils'

/**
 * Two labeled clusters instead of one flat 6-tile grid — the split
 * mirrors the Hero's two CTAs (bespoke design vs. ready-made) so the
 * business model (design & organize custom journeys, *and* distribute
 * ready-made services) reads correctly, not as a generic OTA menu.
 * `coreServices.groups` comes from the same CMS seam, just regrouped.
 */
export async function CoreServicesSection() {
  const { coreServices } = await getHomepageContent()
  const [bespoke, readyMade] = coreServices.groups

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeading eyebrow={coreServices.eyebrow} title={coreServices.title} className="mb-6 max-w-2xl" />

        <Reveal className="flex flex-col gap-6">
          {bespoke && (
            <div>
              <p className="eyebrow mb-3 text-[11px] font-semibold text-mv-sky-cyan">{bespoke.label}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {bespoke.services.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon]
                  // Sprint UI-02: the two tiles no longer share one flat
                  // Navy fill — "Tour đoàn" gets the Brand→Journey Blue
                  // gradient, "MICE & Sự kiện" keeps Deep Navy + Gold as
                  // the section's dedicated premium accent.
                  const isMice = service.id === 'mice'
                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      className={cn(
                        'group flex items-center justify-between gap-6 rounded-2xl p-7 text-white transition-transform duration-300 hover:-translate-y-0.5 sm:p-8',
                        isMice ? 'bg-mv-deep-navy' : 'bg-gradient-mv-brand',
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                          <Icon className={cn('size-6', isMice && 'text-mv-mice-gold')} strokeWidth={1.5} />
                        </span>
                        <p className="font-display text-xl font-bold sm:text-2xl">{service.title}</p>
                      </div>
                      <ArrowUpRight
                        className={cn(
                          'size-5 shrink-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white',
                          isMice ? 'text-mv-mice-gold/70' : 'text-white/60',
                        )}
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {readyMade && (
            <div>
              <p className="eyebrow mb-3 text-[11px] font-semibold text-muted-foreground">{readyMade.label}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {readyMade.services.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon]
                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-mv-border-soft p-6 text-center transition-colors duration-mv-normal hover:border-mv-sky-cyan hover:bg-mv-mist-blue/60"
                    >
                      <span className="grid size-11 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue transition-colors group-hover:bg-mv-journey-blue group-hover:text-white">
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-sm font-semibold leading-tight text-mv-deep-navy">{service.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}
