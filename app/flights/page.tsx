import type { Metadata } from 'next'
import { Plane } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { PlaceholderSection } from '@/components/site/placeholder-section'

export const metadata: Metadata = {
  title: 'Vé máy bay doanh nghiệp | Minh Việt Travel',
  description: 'Quản lý vé máy bay và hành trình công tác cho doanh nghiệp với hệ thống đối tác hàng không toàn cầu.',
}

export default function FlightsPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Vé máy bay doanh nghiệp"
        title="Quản lý vé máy bay & hành trình công tác"
        description="Đặt vé đoàn, quản lý công tác phí và tối ưu hành trình bay cho doanh nghiệp với hệ thống đối tác hàng không toàn cầu."
        breadcrumb="Vé máy bay"
      />
      <PlaceholderSection
        icon={Plane}
        eyebrow="Dịch vụ vé máy bay"
        title="Một đầu mối cho toàn bộ hành trình bay của doanh nghiệp"
        description="Từ đặt vé đoàn đến báo cáo chi phí công tác — Minh Việt đơn giản hóa việc quản lý hành trình bay cho tổ chức của bạn."
        highlights={[
          'Đối tác Vietnam Airlines, Singapore Airlines, ANA, Qatar Airways',
          'Đặt vé đoàn & xuất hóa đơn tập trung',
          'Hỗ trợ đổi lịch, hoàn vé linh hoạt',
          'Báo cáo chi phí công tác định kỳ',
        ]}
      />
    </SiteChrome>
  )
}
