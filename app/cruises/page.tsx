import type { Metadata } from 'next'
import { Ship } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { PlaceholderSection } from '@/components/site/placeholder-section'

export const metadata: Metadata = {
  title: 'Du thuyền cao cấp | Minh Việt Travel',
  description: 'Hành trình du thuyền nghỉ dưỡng 5 sao cho đoàn công tác, sự kiện tri ân và nghỉ dưỡng doanh nghiệp.',
}

export default function CruisesPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Du thuyền cao cấp"
        title="Hành trình du thuyền nghỉ dưỡng 5 sao"
        description="Trải nghiệm du thuyền quốc tế và nội địa dành cho đoàn công tác, sự kiện tri ân và nghỉ dưỡng cao cấp."
        breadcrumb="Du thuyền"
        image="/tour-bali.webp"
      />
      <PlaceholderSection
        icon={Ship}
        eyebrow="Dịch vụ du thuyền"
        title="Từ vịnh Hạ Long đến hải trình quốc tế"
        description="Minh Việt tổ chức trọn gói hành trình du thuyền — từ lựa chọn tàu, gala trên tàu đến kết hợp tour trên bờ."
        highlights={[
          'Du thuyền Hạ Long: Paradise, Ambassador, Scarlet Pearl',
          'Du thuyền quốc tế: Genting Dream & đối tác toàn cầu',
          'Tổ chức gala & sự kiện ngay trên tàu',
          'Gói combo du thuyền kết hợp tour trọn gói',
        ]}
      />
    </SiteChrome>
  )
}
