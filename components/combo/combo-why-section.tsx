import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import type { ComboWhyItem } from '@/types/combo'

/**
 * Section 04 "Vì sao nên chọn Combo" — alternating image/text editorial
 * rows, deliberately NOT the 4-icon-grid pattern used by
 * `MiceProcessSection`/the flight branch's `flight-why-minh-viet-section.tsx`
 * — the brief explicitly rules that treatment out here. Maps over
 * `items`, no hardcoded count.
 */
export function ComboWhySection({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string
  title: string
  description: string
  items: ComboWhyItem[]
}) {
  if (items.length === 0) return null

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />

        <div className="mt-14 space-y-14 lg:space-y-20">
          {items.map((item, index) => {
            const imageOnRight = index % 2 === 1
            return (
              <Reveal
                key={item.id}
                className={cn(
                  'grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16',
                )}
              >
                <div className={cn('relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft', imageOnRight && 'lg:order-2')}>
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className={cn(imageOnRight && 'lg:order-1')}>
                  <h3 className="text-balance font-display text-2xl font-bold leading-tight text-mv-deep-navy sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
