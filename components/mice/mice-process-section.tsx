import { ClipboardList, Target, Lightbulb, PenTool, Radio, ClipboardCheck, type LucideIcon } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceProcessStep } from '@/types/mice'

const STEP_ICONS: LucideIcon[] = [ClipboardList, Target, Lightbulb, PenTool, Radio, ClipboardCheck]

export function MiceProcessSection({ steps }: { steps: MiceProcessStep[] }) {
  return (
    <section id="quy-trinh-mice" className="section-py-md scroll-mt-20 border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Quy trình"
          title="Sáu bước, một đầu mối vận hành"
          description="Mỗi bước đều có đầu ra rõ ràng — không phải một quy trình nội bộ trừu tượng, mà là những gì doanh nghiệp nhận được ở từng giai đoạn."
          className="max-w-2xl"
        />

        <div className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pointer-events-none absolute inset-x-0 top-6 hidden border-t border-dashed border-mv-border-soft lg:block" aria-hidden />

          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? ClipboardList
            return (
              <Reveal key={step.id} delay={i * 70}>
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-mv-deep-navy text-paper shadow-soft">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-display text-2xl font-extrabold text-mv-border-soft">
                      {String(step.order).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-mv-deep-navy">{step.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-mv-slate">{step.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {step.outputs.map((o) => (
                      <span key={o} className="rounded-full bg-mv-mist-blue px-2.5 py-1 text-xs font-medium text-mv-deep-navy">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
