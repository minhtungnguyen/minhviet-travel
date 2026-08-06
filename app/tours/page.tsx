import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { ToursListing } from '@/components/site/tours-listing'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { listPublishedTourCards, listActiveTourCategoryNames } from '@/lib/tours/public-tours'

export const metadata: Metadata = {
  title: 'Tour đoàn & Tour ghép | Minh Việt Travel',
  description: 'Danh sách hành trình tuyển chọn cho doanh nghiệp, tổ chức và khách hàng cao cấp.',
}

// Same cadence as the homepage (app/page.tsx) — this page has no dynamic
// API usage (no searchParams/cookies), so Next statically optimizes it by
// default; without ISR a newly published Tour would only appear after the
// next deploy.
export const revalidate = 300

export default async function ToursPage() {
  const client = getPublicSupabaseClient()
  const [tours, categoryNames] = await Promise.all([listPublishedTourCards(client), listActiveTourCategoryNames(client)])

  return (
    <SiteChrome>
      <PageHero
        eyebrow="Tour đoàn · Tour ghép · Quốc tế & nội địa"
        title="Hành trình được tuyển chọn cho tổ chức của bạn"
        description="Từ tour đoàn doanh nghiệp đến hành trình cá nhân cao cấp — mỗi lịch trình đều được thiết kế và kiểm định bởi chuyên viên Minh Việt."
        breadcrumb="Tour"
        image="/tour-europe.webp"
        ctas={[{ label: 'Nhận tư vấn giải pháp', href: '/contact' }]}
      />
      <ToursListing tours={tours} categoryNames={categoryNames} />
    </SiteChrome>
  )
}
