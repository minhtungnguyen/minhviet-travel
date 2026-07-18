import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { DestinationsRail } from '@/components/homepage/destinations-rail'

export async function DestinationsSection() {
  const { destinations } = await getHomepageContent()

  return (
    <section className="border-t border-border bg-background py-24 lg:py-32">
      <div className="container-mv">
        <SectionHeading
          eyebrow={destinations.eyebrow}
          title={
            <>
              {destinations.title} <span className="text-primary">{destinations.titleAccent}</span>
            </>
          }
          className="max-w-2xl"
        />
        <DestinationsRail destinations={destinations.destinations} />
      </div>
    </section>
  )
}
