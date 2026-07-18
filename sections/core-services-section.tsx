import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { SERVICE_ICONS } from '@/components/homepage/icon-map'
import { Reveal } from '@/components/homepage/reveal'

/**
 * Redesigned from a uniform 6-tile icon grid (Sprint 1 Task 02 audit:
 * reads as a generic OTA feature list) into one dominant tile + a
 * supporting row — hierarchy through layout/size, not new imagery or
 * copy. `coreServices.services` still comes from the same CMS seam
 * (icon/title/href only, no description field) so this stays a pure
 * presentation change.
 */
export async function CoreServicesSection() {
  const { coreServices } = await getHomepageContent()
  const [featured, ...rest] = coreServices.services
  const FeaturedIcon = featured ? SERVICE_ICONS[featured.icon] : null

  return (
    <section className="border-t border-border bg-background py-20 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={coreServices.eyebrow} title={coreServices.title} className="mb-10 max-w-2xl" />

        <Reveal className="flex flex-col gap-4">
          {featured && FeaturedIcon && (
            <Link
              href={featured.href}
              className="group flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-10"
            >
              <div className="flex items-center gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10">
                  <FeaturedIcon className="size-7" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold sm:text-3xl">{featured.title}</p>
                  <p className="mt-1 text-sm text-primary-foreground/65">Dịch vụ chủ lực của Minh Việt</p>
                </div>
              </div>
              <ArrowUpRight className="size-6 shrink-0 text-primary-foreground/60 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary-foreground" />
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {rest.map((service) => {
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
        </Reveal>
      </div>
    </section>
  )
}
