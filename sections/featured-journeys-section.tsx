import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { FeaturedJourneysGrid } from '@/components/homepage/featured-journeys-grid'
import { Button } from '@/components/ui/button'

export async function FeaturedJourneysSection() {
  const { featuredJourneys } = await getHomepageContent()

  return (
    <section id="tour-ghep-quoc-te" className="scroll-mt-20 bg-background py-24 lg:py-32">
      <div className="container-mv">
        <div className="flex flex-col gap-8 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={featuredJourneys.eyebrow}
            title={
              <>
                {featuredJourneys.title} <span className="text-primary">{featuredJourneys.titleAccent}</span>
              </>
            }
            className="max-w-2xl"
          />
          <Button
            variant="outline"
            size="default"
            className="hidden shrink-0 md:inline-flex"
            render={<Link href={featuredJourneys.viewAllCta.href} />}
          >
            {featuredJourneys.viewAllCta.label} <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-8">
          <FeaturedJourneysGrid content={featuredJourneys} />
        </div>

        <div className="mt-10 flex justify-center md:hidden">
          <Button variant="outline" size="default" render={<Link href={featuredJourneys.viewAllCta.href} />}>
            {featuredJourneys.viewAllCta.label} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
