import Link from 'next/link'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { SERVICE_ICONS } from '@/components/homepage/icon-map'
import { Reveal } from '@/components/homepage/reveal'

export async function CoreServicesSection() {
  const { coreServices } = await getHomepageContent()

  return (
    <section className="border-t border-border bg-background py-20 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={coreServices.eyebrow} title={coreServices.title} className="mb-10 max-w-2xl" />
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {coreServices.services.map((service) => {
              const Icon = SERVICE_ICONS[service.icon]
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
                    {service.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
