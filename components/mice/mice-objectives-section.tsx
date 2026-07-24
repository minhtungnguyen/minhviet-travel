import Link from 'next/link'
import {
  Users,
  Award,
  Target,
  BookOpenText,
  HeartHandshake,
  Rocket,
  GraduationCap,
  Handshake,
  Building2,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceObjective } from '@/types/mice'

const OBJECTIVE_ICONS: Record<string, LucideIcon> = {
  'obj-gan-ket': Users,
  'obj-vinh-danh': Award,
  'obj-hoi-nghi': Target,
  'obj-hoi-thao': BookOpenText,
  'obj-tri-an': HeartHandshake,
  'obj-ra-mat': Rocket,
  'obj-dao-tao': GraduationCap,
  'obj-doi-tac': Handshake,
  'obj-van-hoa': Building2,
  'obj-thuong-nien': CalendarDays,
}

export function MiceObjectivesSection({ objectives }: { objectives: MiceObjective[] }) {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Mục tiêu doanh nghiệp"
          title="Bắt đầu từ điều doanh nghiệp muốn đạt được"
          description="Trước khi chọn loại hình chương trình, Minh Việt bắt đầu từ mục tiêu thực sự của bạn."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {objectives.map((o, i) => {
            const Icon = OBJECTIVE_ICONS[o.id] ?? Target
            const content = (
              <div className="group flex h-full flex-col gap-3 rounded-2xl border border-mv-border-soft bg-card p-5 transition-all duration-mv-normal hover:-translate-y-0.5 hover:border-mv-sky-cyan hover:shadow-soft-lg">
                <span className="grid size-10 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue transition-colors group-hover:bg-mv-journey-blue group-hover:text-white">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-mv-deep-navy">{o.title}</h3>
                  <p className="mt-1 text-pretty text-xs leading-relaxed text-mv-slate">{o.description}</p>
                </div>
              </div>
            )
            return (
              <Reveal key={o.id} delay={(i % 5) * 60}>
                {o.relatedHref ? (
                  <Link href={o.relatedHref} className="block h-full">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
