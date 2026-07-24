import {
  MapPin,
  CalendarDays,
  Route,
  Building,
  Bus,
  UtensilsCrossed,
  Activity,
  UsersRound,
  PartyPopper,
  Ticket,
  Mic2,
  Camera,
  ShieldCheck,
  Gift,
  Star,
  Languages,
  Radio,
} from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'

const GROUPS = [
  {
    label: 'Hành trình & lưu trú',
    items: [
      { icon: MapPin, label: 'Điểm đến' },
      { icon: CalendarDays, label: 'Thời gian' },
      { icon: Route, label: 'Lịch trình' },
      { icon: Building, label: 'Khách sạn' },
      { icon: Bus, label: 'Phương tiện' },
    ],
  },
  {
    label: 'Trải nghiệm & sự kiện',
    items: [
      { icon: UtensilsCrossed, label: 'Nhà hàng' },
      { icon: Activity, label: 'Hoạt động' },
      { icon: UsersRound, label: 'Team Building' },
      { icon: PartyPopper, label: 'Gala Dinner' },
      { icon: Ticket, label: 'Vé tham quan' },
      { icon: Mic2, label: 'MC / nghệ sĩ' },
      { icon: Camera, label: 'Media' },
    ],
  },
  {
    label: 'Dịch vụ đi kèm',
    items: [
      { icon: ShieldCheck, label: 'Bảo hiểm' },
      { icon: Gift, label: 'Quà tặng' },
      { icon: Star, label: 'Yêu cầu VIP' },
      { icon: Languages, label: 'Ngôn ngữ' },
      { icon: Radio, label: 'Điều phối tại chỗ' },
    ],
  },
] as const

export function CustomizationSection() {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Tùy chỉnh hành trình"
          title="Mọi chi tiết đều có thể điều chỉnh"
          description="Bạn quyết định trọng tâm, Minh Việt lo phần còn lại — không hạng mục nào là mặc định cố định."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.label} delay={gi * 90}>
              <div className="h-full rounded-2xl bg-card p-6 shadow-soft">
                <h3 className="eyebrow text-[11px] font-semibold text-mv-journey-blue">{group.label}</h3>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li
                        key={item.label}
                        className="inline-flex items-center gap-2 rounded-full border border-mv-border-soft bg-mv-mist-blue/60 px-3.5 py-2 text-sm font-medium text-mv-deep-navy"
                      >
                        <Icon className="size-4 text-mv-journey-blue" strokeWidth={1.75} />
                        {item.label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
