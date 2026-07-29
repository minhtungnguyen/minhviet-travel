import { getHomepageContent } from '@/lib/cms/client'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { SectionHeading } from '@/components/homepage/section-heading'

const ATTRACTION_TICKET_SERVICE_OPTION = { value: 'attraction-ticket', label: 'Vé vui chơi & trải nghiệm' }

/**
 * Same reuse pattern as `combo-consultation-form.tsx`/`mice-consultation-form.tsx`:
 * `ConsultationTabs` → `LeadForm` → `submitLeadAction`, no parallel form/submit
 * logic. `defaultTab="organization"` + `audienceType: 'ORGANIZATION'` because this
 * page exists specifically for group/corporate ticket requests (D4) — the individual
 * booking flow is the inline `AttractionBookingPanel` on Product Detail, not this form.
 */
export async function AttractionCorporateConsultationForm() {
  const { finalCta, coreServices } = await getHomepageContent()
  const existingOptions = coreServices.groups.flatMap((group) => group.services).map((service) => ({
    value: service.id,
    label: service.title,
  }))
  const serviceOptions = existingOptions.some((o) => o.value === ATTRACTION_TICKET_SERVICE_OPTION.value)
    ? existingOptions
    : [ATTRACTION_TICKET_SERVICE_OPTION, ...existingOptions]

  return (
    <section id="dat-doan-form" className="scroll-mt-20 border-t border-mv-border-soft bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <SectionHeading
          eyebrow="Gửi yêu cầu"
          title="Nhận báo giá vé đoàn/doanh nghiệp"
          onDark
          align="center"
          className="mx-auto max-w-xl"
        />

        <div className="mx-auto mt-10 max-w-xl">
          <ConsultationTabs
            content={finalCta}
            serviceOptions={serviceOptions}
            defaultTab="organization"
            prefill={{
              source: 'ATTRACTION_TICKET_CORPORATE_LANDING',
              landingIntent: 'ATTRACTION_TICKET_GROUP',
              serviceType: 'ATTRACTION_TICKET',
              audienceType: 'ORGANIZATION',
              defaultServiceInterest: ATTRACTION_TICKET_SERVICE_OPTION.value,
              showEventDetails: true,
            }}
          />
        </div>
      </div>
    </section>
  )
}
