import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { AttractionCorporateConsultationForm } from '@/components/attraction-ticket/attraction-corporate-consultation-form'
import { SITE_URL } from '@/constants/seo'

export const metadata: Metadata = {
  title: 'Đặt vé đoàn/doanh nghiệp | Minh Việt Travel',
  description: 'Đặt vé vui chơi theo đoàn hoặc cho nhu cầu doanh nghiệp — gửi yêu cầu, đội ngũ Minh Việt tư vấn báo giá phù hợp.',
  alternates: { canonical: '/ve-vui-choi/dat-doan' },
  openGraph: {
    title: 'Đặt vé đoàn/doanh nghiệp | Minh Việt Travel',
    description: 'Đặt vé vui chơi theo đoàn hoặc cho nhu cầu doanh nghiệp — gửi yêu cầu, đội ngũ Minh Việt tư vấn báo giá phù hợp.',
    url: `${SITE_URL}/ve-vui-choi/dat-doan`,
    locale: 'vi_VN',
    type: 'website',
  },
}

/**
 * Corporate Booking entry point (D4, 14-implementation-plan.md Bước 9,
 * 15-review-package-v1.md §7). Scope is intentionally the route + entry
 * form only — no auto quote-by-quantity, no internal approval flow, no VAT
 * invoicing (explicitly out of scope for V1). Reuses `LeadForm`/
 * `ConsultationTabs`/`submitLeadAction` verbatim via
 * `AttractionCorporateConsultationForm`, same pattern as Combo/MICE.
 */
export default function AttractionTicketCorporatePage() {
  return (
    <SiteChrome>
      <section className="border-b border-mv-border-soft bg-mv-ice-blue/40 py-14 lg:py-16">
        <div className="container-mv">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/ve-vui-choi" className="transition-colors hover:text-mv-journey-blue">
              Vé vui chơi
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Đặt vé đoàn/doanh nghiệp</span>
          </nav>

          <SectionHeading
            eyebrow="Đoàn / Doanh nghiệp"
            title="Đặt vé vui chơi theo đoàn hoặc cho doanh nghiệp"
            description="Số lượng lớn, lịch trình riêng, hoặc nhu cầu team building — gửi yêu cầu để đội ngũ Minh Việt liên hệ báo giá phù hợp."
          />
        </div>
      </section>

      <AttractionCorporateConsultationForm />
    </SiteChrome>
  )
}
