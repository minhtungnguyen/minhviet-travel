import { getHomepageContent } from '@/lib/cms/client'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { SectionHeading } from '@/components/homepage/section-heading'

const COMBO_SERVICE_OPTION = { value: 'combo', label: 'Combo du lịch' }

/**
 * Exact same wiring as `mice-consultation-form.tsx`/
 * `custom-tour-consultation-form.tsx`: reuses the shared
 * `ConsultationTabs` → `LeadForm` → `submitLeadAction` path, no parallel
 * form/submit logic. Only additive `prefill` is layered on top so leads
 * from this page are tagged for CRM routing.
 */
export async function ComboConsultationForm() {
  const { finalCta, coreServices } = await getHomepageContent()
  const existingOptions = coreServices.groups.flatMap((group) => group.services).map((service) => ({
    value: service.id,
    label: service.title,
  }))
  const serviceOptions = existingOptions.some((o) => o.value === COMBO_SERVICE_OPTION.value)
    ? existingOptions
    : [COMBO_SERVICE_OPTION, ...existingOptions]

  return (
    <section id="combo-form" className="scroll-mt-20 border-t border-mv-border-soft bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <SectionHeading
          eyebrow="Gửi yêu cầu"
          title="Bắt đầu đặt Combo hoặc thiết kế riêng cho bạn"
          onDark
          align="center"
          className="mx-auto max-w-xl"
        />

        <div className="mx-auto mt-10 max-w-xl">
          <ConsultationTabs
            content={finalCta}
            serviceOptions={serviceOptions}
            defaultTab="individual"
            prefill={{
              source: 'COMBO_LANDING',
              landingIntent: 'COMBO',
              serviceType: 'COMBO',
              defaultServiceInterest: COMBO_SERVICE_OPTION.value,
            }}
          />
        </div>
      </div>
    </section>
  )
}
