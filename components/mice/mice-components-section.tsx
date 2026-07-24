import {
  MapPin,
  Plane,
  Bus,
  Building,
  ShieldCheck,
  DoorOpen,
  Presentation,
  AudioLines,
  Lightbulb,
  MonitorPlay,
  PanelTop,
  Mic2,
  Music4,
  UsersRound,
  PartyPopper,
  UtensilsCrossed,
  Wrench,
  HeartHandshake,
  Camera,
  Radio,
  DroneIcon,
  ImagePlay,
  Gift,
  Languages,
  UserCog,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceComponentGroup } from '@/types/mice'

const ITEM_ICON: Record<string, LucideIcon> = {
  'Điểm đến': MapPin,
  'Vé máy bay': Plane,
  'Xe đưa đón': Bus,
  'Khách sạn / Resort': Building,
  'Bảo hiểm': ShieldCheck,
  'Phòng hội nghị': DoorOpen,
  'Sân khấu': Presentation,
  'Âm thanh': AudioLines,
  'Ánh sáng': Lightbulb,
  LED: MonitorPlay,
  Backdrop: PanelTop,
  MC: Mic2,
  'Nghệ sĩ': Music4,
  'Team Building': UsersRound,
  'Gala Dinner': PartyPopper,
  'Tiệc': UtensilsCrossed,
  Workshop: Wrench,
  CSR: HeartHandshake,
  Media: Camera,
  Livestream: Radio,
  Drone: DroneIcon,
  Photobooth: ImagePlay,
  'Quà tặng': Gift,
  'Phiên dịch': Languages,
  'Điều phối viên': UserCog,
  'Báo cáo nghiệm thu': ClipboardCheck,
}

export function MiceComponentsSection({ groups }: { groups: MiceComponentGroup[] }) {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Cấu phần tùy chỉnh"
          title="Mọi hạng mục đều có thể tích hợp trong một chương trình"
          description="Từ di chuyển đến sân khấu, media và điều phối tại chỗ — Minh Việt tổng hợp thành một báo giá duy nhất, một đầu mối duy nhất."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 80}>
              <div className="h-full rounded-2xl bg-card p-6 shadow-soft">
                <h3 className="eyebrow text-[11px] font-semibold text-mv-journey-blue">{group.label}</h3>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {group.items.map((item) => {
                    const Icon = ITEM_ICON[item] ?? Wrench
                    return (
                      <li
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-mv-border-soft bg-mv-mist-blue/60 px-3.5 py-2 text-sm font-medium text-mv-deep-navy"
                      >
                        <Icon className="size-4 text-mv-journey-blue" strokeWidth={1.75} />
                        {item}
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
