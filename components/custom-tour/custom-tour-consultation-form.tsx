import { getHomepageContent } from '@/lib/cms/client'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { SectionHeader } from '@/components/mv/section'

const CUSTOM_TOUR_SERVICE_OPTION = { value: 'custom-tour-design', label: 'Thiết kế chương trình riêng' }

/**
 * Reuses the exact same `ConsultationTabs` → `LeadForm` → `submitLeadAction`
 * path as the Homepage — no parallel form/submit logic. Only additive
 * prefill is layered on top: a landing-specific service option prepended
 * (and selected by default) plus hidden CRM tags, per task brief §14.
 */
export async function CustomTourConsultationForm() {
  const { finalCta, coreServices } = await getHomepageContent()
  const serviceOptions = [
    CUSTOM_TOUR_SERVICE_OPTION,
    ...coreServices.groups.flatMap((group) => group.services).map((service) => ({
      value: service.id,
      label: service.title,
    })),
  ]

  return (
    <section id="custom-tour-form" className="scroll-mt-20 border-t border-mv-border-soft bg-mv-deep-navy py-16 lg:py-20">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Gửi yêu cầu"
          title="Bắt đầu thiết kế chương trình của bạn"
          onDark
          className="mx-auto max-w-xl text-center"
        />

        <div className="mx-auto mt-10 max-w-xl">
          <ConsultationTabs
            content={finalCta}
            serviceOptions={serviceOptions}
            defaultTab="organization"
            prefill={{
              source: 'CUSTOM_TOUR_LANDING',
              landingIntent: 'CUSTOM_DESIGN',
              serviceType: 'GROUP_TOUR',
              defaultServiceInterest: CUSTOM_TOUR_SERVICE_OPTION.value,
            }}
          />
        </div>
      </div>
    </section>
  )
}
