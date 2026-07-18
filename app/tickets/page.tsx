import type { Metadata } from 'next'
import { Ticket } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { PlaceholderSection } from '@/components/site/placeholder-section'

export const metadata: Metadata = {
  title: 'Vé vui chơi & Trải nghiệm | Minh Việt Travel',
  description: 'Đặt vé công viên giải trí, show diễn và các trải nghiệm điểm đến cho đoàn khách với mức giá ưu đãi.',
}

export default function TicketsPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Trải nghiệm & vé vui chơi"
        title="Vé công viên, show diễn & trải nghiệm giải trí"
        description="Đặt vé công viên giải trí, show diễn và các trải nghiệm điểm đến cho đoàn khách với mức giá ưu đãi."
        breadcrumb="Vé vui chơi"
      />
      <PlaceholderSection
        icon={Ticket}
        eyebrow="Dịch vụ vé & trải nghiệm"
        title="Điểm nhấn giải trí cho mọi hành trình"
        description="Minh Việt kết hợp linh hoạt các trải nghiệm giải trí vào tour trọn gói hoặc đặt riêng theo yêu cầu của đoàn."
        highlights={[
          'Vé đoàn công viên giải trí & khu du lịch',
          'Show diễn văn hóa & giải trí bản địa',
          'Hỗ trợ đặt vé nhanh theo lịch trình',
          'Kết hợp linh hoạt trong tour trọn gói',
        ]}
      />
    </SiteChrome>
  )
}
