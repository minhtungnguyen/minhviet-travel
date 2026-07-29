import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { ComboVisualTile } from '@/components/combo/combo-visual-tile'
import type { ComboDestination } from '@/types/combo'

/**
 * Section 03 "Destination Explorer" — fully data-driven, no hardcoded
 * destination list. Only `status: 'published'` destinations (those with
 * real, brand-quality photography) are passed in by the page, so this
 * section grows automatically as real assets are added later — see
 * `lib/combo/combo-repository.ts`'s `getPublishedDestinations`.
 */
export function ComboDestinationExplorerSection({
  eyebrow,
  title,
  description,
  destinations,
}: {
  eyebrow: string
  title: string
  description: string
  destinations: ComboDestination[]
}) {
  if (destinations.length === 0) return null

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <Reveal key={destination.id} delay={index * 60}>
              <ComboVisualTile
                image={destination.image}
                title={destination.name}
                subtitle={destination.tagline}
                meta={destination.stat}
                href={destination.href}
                size="lg"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
