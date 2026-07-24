import { Users2, Gift, Presentation, PartyPopper } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceSolution } from '@/types/mice'

const TERM_ICON = { meeting: Users2, incentive: Gift, conference: Presentation, event: PartyPopper } as const

/**
 * SEO-carrying section ("MICE là gì?") kept scannable per brief §VI — four
 * compact visual blocks, not a wall of paragraph text. Pulls the English
 * term / Vietnamese name / example applications straight from the same
 * `solutions` content the deeper §VIII section uses, so the two never
 * drift out of sync with each other.
 */
export function MiceDefinitionSection({ solutions }: { solutions: MiceSolution[] }) {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="MICE là gì"
          title="MICE: Meetings, Incentives, Conferences, Exhibitions"
          description="MICE là mô hình kết hợp hoạt động doanh nghiệp với du lịch, lưu trú, hội họp, sự kiện, khen thưởng và trải nghiệm tập thể — thay vì tách rời từng phần, cả chương trình được thiết kế và vận hành như một thể thống nhất."
          className="max-w-3xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s, i) => {
            const Icon = TERM_ICON[s.type]
            return (
              <Reveal key={s.id} delay={i * 70}>
                <div className="h-full rounded-2xl border border-mv-border-soft bg-card p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">{s.termEn}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-mv-deep-navy">{s.displayName}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-mv-slate">{s.objective}</p>
                  <p className="mt-3 text-xs text-mv-slate/80">
                    Ví dụ: <span className="font-medium text-mv-deep-navy">{s.applications.slice(0, 2).join(', ')}</span>
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
