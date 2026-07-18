import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { PlaceholderSection } from '@/components/site/placeholder-section'

export const metadata: Metadata = {
  title: 'Khách sạn & Lưu trú doanh nghiệp | Minh Việt Travel',
  description: 'Mạng lưới khách sạn và khu nghỉ dưỡng cao cấp cho công tác, hội nghị và nghỉ dưỡng doanh nghiệp.',
}

export default function HotelsPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Lưu trú doanh nghiệp"
        title="Hệ thống khách sạn & khu nghỉ dưỡng cao cấp"
        description="Mạng lưới đối tác 4–5 sao toàn cầu, đàm phán giá đoàn và chính sách linh hoạt cho công tác, hội nghị và nghỉ dưỡng."
        breadcrumb="Khách sạn"
        image="/dest-singapore.webp"
      />
      <PlaceholderSection
        icon={Building2}
        eyebrow="Dịch vụ lưu trú"
        title="Giá đoàn ưu đãi, tiêu chuẩn dịch vụ đồng nhất"
        description="Minh Việt làm việc trực tiếp với các tập đoàn khách sạn hàng đầu để đảm bảo giá tốt nhất và trải nghiệm nhất quán cho mọi quy mô đoàn."
        highlights={[
          'Giá đoàn ưu đãi cho 50 – 1.000+ phòng',
          'Đối tác Marriott, Accor, InterContinental, Vinpearl',
          'Hỗ trợ đặt phòng & thanh toán tập trung',
          'Phòng họp và không gian sự kiện tại chỗ',
        ]}
      />
    </SiteChrome>
  )
}
