import { getHomepageContent } from '@/lib/cms/client'
import { DualPathCta } from '@/components/homepage/dual-path-cta'

export async function FinalCtaSection() {
  const { finalCta, coreServices } = await getHomepageContent()
  const serviceOptions = coreServices.groups
    .flatMap((group) => group.services)
    .map((service) => ({
      value: service.id,
      label: service.title,
    }))

  return (
    <section className="section-py-md bg-gradient-mv-consultation">
      <div className="container-mv">
        <DualPathCta content={finalCta} serviceOptions={serviceOptions} />
      </div>
    </section>
  )
}
