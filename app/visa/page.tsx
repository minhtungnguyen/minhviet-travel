import type { Metadata } from 'next'
import { FileCheck2 } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { PlaceholderSection } from '@/components/site/placeholder-section'

export const metadata: Metadata = {
  title: 'Visa & Thủ tục xuất nhập cảnh | Minh Việt Travel',
  description: 'Tư vấn và xử lý hồ sơ visa công tác, du lịch và đoàn doanh nghiệp với quy trình rõ ràng, tỷ lệ đậu cao.',
}

export default function VisaPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Visa & thủ tục xuất nhập cảnh"
        title="Tư vấn & xử lý hồ sơ visa toàn diện"
        description="Hỗ trợ hồ sơ visa công tác, du lịch và đoàn doanh nghiệp với quy trình rõ ràng, minh bạch."
        breadcrumb="Visa"
      />
      <PlaceholderSection
        icon={FileCheck2}
        eyebrow="Dịch vụ visa"
        title="Hồ sơ minh bạch, đồng hành đến khi hoàn tất"
        description="Đội ngũ chuyên viên visa của Minh Việt hỗ trợ chuẩn bị, rà soát và theo dõi hồ sơ cho từng thị trường cụ thể."
        highlights={[
          'Visa công tác, du lịch & đoàn doanh nghiệp',
          'Tư vấn hồ sơ theo từng quốc gia',
          'Theo dõi tiến độ & hỗ trợ bổ sung hồ sơ',
          'Ưu tiên xử lý cho đoàn số lượng lớn',
        ]}
      />
    </SiteChrome>
  )
}
