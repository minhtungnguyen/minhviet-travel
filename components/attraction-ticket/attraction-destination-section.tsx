import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { AttractionVisualTile } from '@/components/attraction-ticket/attraction-visual-tile'

export type AttractionDestinationTile = {
  slug: string
  name: string
  tagline: string
  imageUrl: string
  imageAlt: string
  productCount: number
}

export function AttractionDestinationSection({ destinations }: { destinations: AttractionDestinationTile[] }) {
  if (destinations.length === 0) return null

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Điểm đến" title="Chọn điểm đến để xem vé" description="Vé vui chơi đã sẵn sàng tại các điểm đến sau." />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <Reveal key={destination.slug} delay={index * 60}>
              <AttractionVisualTile
                imageUrl={destination.imageUrl}
                imageAlt={destination.imageAlt}
                title={destination.name}
                subtitle={destination.tagline}
                meta={`${destination.productCount} vé đang bán`}
                href={`/ve-vui-choi/${destination.slug}`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
