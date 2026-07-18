import { getHomepageContent } from '@/lib/cms/client'
import { DualPathCta } from '@/components/homepage/dual-path-cta'

export async function FinalCtaSection() {
  const { finalCta, coreServices } = await getHomepageContent()
  const serviceOptions = coreServices.services.map((service) => ({
    value: service.id,
    label: service.title,
  }))

  return (
    <section className="bg-deep py-20 lg:py-24">
      <div className="container-mv">
        <DualPathCta content={finalCta} serviceOptions={serviceOptions} />
      </div>
    </section>
  )
}
