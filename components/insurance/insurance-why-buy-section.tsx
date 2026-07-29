import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { getInsuranceIcon } from '@/components/insurance/insurance-icon'
import type { InsuranceLandingContent } from '@/types/insurance'

export function InsuranceWhyBuySection({ content }: { content: InsuranceLandingContent['whyBuy'] }) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} align="center" className="mx-auto max-w-2xl" />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item, index) => {
            const Icon = getInsuranceIcon(item.icon)
            return (
              <Reveal key={item.id} delay={index * 60} className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mv-mist-blue text-mv-journey-blue">
                  <Icon className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-mv-deep-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
