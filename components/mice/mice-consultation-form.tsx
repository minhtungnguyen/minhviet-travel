import { getHomepageContent } from '@/lib/cms/client'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { SectionHeader } from '@/components/mv/section'

const MICE_SERVICE_OPTION = { value: 'mice', label: 'MICE & Sự kiện' }

/**
 * Reuses the exact same `ConsultationTabs` → `LeadForm` →
 * `submitLeadAction` path as the Homepage and `/tour-thiet-ke` — no
 * parallel form/submit logic (brief §III/§XVII: "Không tạo hệ form riêng
 * nếu form Consultation hiện có tái sử dụng được"). Only additive prefill
 * is layered on top, plus `showEventDetails` for the richer V1 field set
 * this brief asks for (guest count / date / location / budget — all
 * optional, grouped under "Thông tin bổ sung").
 */
export async function MiceConsultationForm() {
  const { finalCta, coreServices } = await getHomepageContent()
  const existingOptions = coreServices.groups.flatMap((group) => group.services).map((service) => ({
    value: service.id,
    label: service.title,
  }))
  // The homepage's own coreServices already has a "mice" option (id
  // 'mice', label 'MICE & Sự kiện') — reuse it instead of duplicating a
  // second entry with the same value.
  const serviceOptions = existingOptions.some((o) => o.value === MICE_SERVICE_OPTION.value)
    ? existingOptions
    : [MICE_SERVICE_OPTION, ...existingOptions]

  return (
    <section id="mice-form" className="scroll-mt-20 border-t border-mv-border-soft bg-mv-deep-navy py-16 lg:py-20">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Gửi yêu cầu"
          title="Bắt đầu thiết kế chương trình MICE của bạn"
          onDark
          className="mx-auto max-w-xl text-center"
        />

        <div className="mx-auto mt-10 max-w-xl">
          <ConsultationTabs
            content={finalCta}
            serviceOptions={serviceOptions}
            defaultTab="organization"
            prefill={{
              source: 'MICE_LANDING',
              landingIntent: 'MICE_DESIGN',
              serviceType: 'MICE',
              audienceType: 'ORGANIZATION',
              defaultServiceInterest: MICE_SERVICE_OPTION.value,
              showEventDetails: true,
            }}
          />
        </div>
      </div>
    </section>
  )
}
