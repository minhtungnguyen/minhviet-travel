import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { SERVICE_ICONS } from '@/components/homepage/icon-map'
import { Reveal } from '@/components/homepage/reveal'

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
    <section className="border-t border-border bg-background py-20 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={coreServices.eyebrow} title={coreServices.title} className="mb-10 max-w-2xl" />

        <Reveal className="flex flex-col gap-10">
          {bespoke && (
            <div>
              <p className="eyebrow mb-4 text-[11px] font-semibold text-accent">{bespoke.label}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {bespoke.services.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon]
                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      className="group flex items-center justify-between gap-6 rounded-3xl bg-primary p-7 text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:p-8"
                    >
                      <div className="flex items-center gap-5">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                          <Icon className="size-6" strokeWidth={1.5} />
                        </span>
                        <p className="font-display text-xl font-bold sm:text-2xl">{service.title}</p>
                      </div>
                      <ArrowUpRight className="size-5 shrink-0 text-primary-foreground/60 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary-foreground" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {readyMade && (
            <div>
              <p className="eyebrow mb-4 text-[11px] font-semibold text-muted-foreground">{readyMade.label}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {readyMade.services.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon]
                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-border/70 p-6 text-center transition-colors duration-200 hover:border-primary/30 hover:bg-secondary/50"
                    >
                      <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-sm font-semibold leading-tight text-foreground">{service.title}</span>
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
