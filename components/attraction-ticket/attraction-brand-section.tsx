import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { AttractionVisualTile } from '@/components/attraction-ticket/attraction-visual-tile'

export type AttractionBrandTile = {
  slug: string
  name: string
  imageUrl: string
  imageAlt: string
  destinationSlug: string
  productCount: number
}

/**
 * Mandatory section (D6, docs/design/mv-ticket/DESIGN-BIBLE-v1.0.md §3) —
 * not conditional like most other homepage sections. Shows every
 * `attraction_venues.is_featured = true` venue with its real product count
 * (#11 of the 2026-07-28 decisions — same "N trải nghiệm" pattern already
 * proven on AttractionDestinationSection, not a new mechanic).
 *
 * Links to the venue's destination listing (`/ve-vui-choi/[destinationSlug]`)
 * — there is no dedicated per-venue landing route in the IA yet, so this is
 * the closest real, working page rather than a fabricated URL.
 */
export function AttractionBrandSection({ venues }: { venues: AttractionBrandTile[] }) {
  if (venues.length === 0) return null

  return (
    <section className="border-t border-border bg-background py-14 lg:py-20">
      <div className="container-mv">
        <SectionHeading eyebrow="Thương hiệu" title="Khu vui chơi nổi bật" description="Các thương hiệu vui chơi giải trí đang có vé trên Minh Việt." />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {venues.map((venue, index) => (
            <Reveal key={venue.slug} delay={index * 60}>
              <AttractionVisualTile
                variant="brand"
                imageUrl={venue.imageUrl}
                imageAlt={venue.imageAlt}
                title={venue.name}
                meta={`${venue.productCount} trải nghiệm`}
                href={`/ve-vui-choi/${venue.destinationSlug}`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
