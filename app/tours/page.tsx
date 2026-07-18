import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { ToursListing } from '@/components/site/tours-listing'

export const metadata: Metadata = {
  title: 'Tour đoàn & Tour ghép | Minh Việt Travel',
  description: 'Danh sách hành trình tuyển chọn cho doanh nghiệp, tổ chức và khách hàng cao cấp.',
}

export default function ToursPage() {
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
      <ToursListing />
    </SiteChrome>
  )
}
