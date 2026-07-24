import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { CustomTourHero } from '@/components/custom-tour/custom-tour-hero'
import { AudienceSection } from '@/components/custom-tour/audience-section'
import { ProgramTypesSection } from '@/components/custom-tour/program-types-section'
import { ProcessSection } from '@/components/custom-tour/process-section'
import { CustomizationSection } from '@/components/custom-tour/customization-section'
import { InspirationProgramsSection } from '@/components/custom-tour/inspiration-programs-section'
import { CapabilitySection } from '@/components/custom-tour/capability-section'
import { CaseStudyGallery } from '@/components/custom-tour/case-study-gallery'
import { CustomTourFAQ } from '@/components/custom-tour/custom-tour-faq'
import { CustomTourFinalCta } from '@/components/custom-tour/custom-tour-final-cta'
import { CustomTourConsultationForm } from '@/components/custom-tour/custom-tour-consultation-form'

export const metadata: Metadata = {
  title: 'Tour thiết kế trọn gói theo yêu cầu | Minh Việt Travel',
  description:
    'Minh Việt Travel thiết kế và tổ chức tour doanh nghiệp, MICE, team building, gala dinner, tour gia đình và đoàn riêng theo mục tiêu, ngân sách và yêu cầu thực tế.',
  alternates: { canonical: '/tour-thiet-ke' },
  openGraph: {
    title: 'Tour thiết kế trọn gói theo yêu cầu | Minh Việt Travel',
    description:
      'Minh Việt Travel thiết kế và tổ chức tour doanh nghiệp, MICE, team building, gala dinner, tour gia đình và đoàn riêng theo mục tiêu, ngân sách và yêu cầu thực tế.',
    url: 'https://www.minhviettravel.com/tour-thiet-ke',
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: '/enterprise-mice.webp' }],
  },
}

/**
 * Conversion landing page for the Homepage Hero's "Thiết kế chương trình
 * riêng" CTA — content-first (10 storytelling sections), form last. Every
 * section is a Server Component; only the reused `ConsultationTabs` form
 * tree is interactive. No CMS content model for this page yet — copy is
 * local to these components (see CUSTOM_TOUR_LANDING_PAGE.md §12).
 */
export default function CustomTourLandingPage() {
  return (
    <SiteChrome>
      <CustomTourHero />
      <AudienceSection />
      <ProgramTypesSection />
      <ProcessSection />
      <CustomizationSection />
      <InspirationProgramsSection />
      <CapabilitySection />
      <CaseStudyGallery />
      <CustomTourFAQ />
      <CustomTourFinalCta />
      <CustomTourConsultationForm />
    </SiteChrome>
  )
}
