import { getHomepageContent } from '@/lib/cms/client'
import { getHomepageInspiration } from '@/lib/inspiration/inspiration-demo-data'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { TravelInspirationHub } from '@/components/homepage/travel-inspiration-hub'

/**
 * Sprint UI-03 — replaces `sections/final-cta-section.tsx`. Two columns
 * at `lg:` and up (form ~46%, Inspiration Hub ~54%, per brief §II);
 * below `lg` it's a single column with the form first (DOM order), which
 * also covers the "tablet too tight -> 1 column" case without extra
 * breakpoint logic. Background reuses Sprint UI-02's
 * `bg-gradient-mv-consultation` (Deep Navy -> Brand Blue) — already the
 * "gradient nhẹ, không pure black" this brief also asks for.
 */
export async function ConsultationInspirationSection() {
  const { finalCta, coreServices } = await getHomepageContent()
  const serviceOptions = coreServices.groups
    .flatMap((group) => group.services)
    .map((service) => ({
      value: service.id,
      label: service.title,
    }))
  const inspiration = getHomepageInspiration()

  return (
    <section id="lead-form" className="scroll-mt-20 bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <div className="grid gap-10 lg:grid-cols-[0.46fr_0.54fr] lg:items-start lg:gap-9 [&>*]:min-w-0">
          <ConsultationTabs content={finalCta} serviceOptions={serviceOptions} />
          <TravelInspirationHub {...inspiration} />
        </div>
      </div>
    </section>
  )
}
