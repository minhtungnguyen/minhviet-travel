import { Users, Briefcase, Sparkles, Settings2, type LucideIcon } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceBenefitCategory } from '@/types/mice'

const CATEGORY_ICON: Record<string, LucideIcon> = {
  'benefit-nguoi': Users,
  'benefit-kinhdoanh': Briefcase,
  'benefit-thuonghieu': Sparkles,
  'benefit-vanhanh': Settings2,
}

/** Editorial blocks, not a table — matches brief §IX ("không dùng bảng khô cứng"). */
export function MiceBenefitsSection({ categories }: { categories: MiceBenefitCategory[] }) {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Lợi ích"
          title="Giá trị MICE mang lại, theo từng khía cạnh"
          description="Không chỉ là một chuyến đi — mỗi chương trình tác động đến con người, kinh doanh, thương hiệu và cách tổ chức vận hành."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = CATEGORY_ICON[cat.id] ?? Sparkles
            return (
              <Reveal key={cat.id} delay={i * 80}>
                <div className="h-full rounded-2xl bg-card p-6 shadow-soft">
                  <span className="grid size-11 place-items-center rounded-xl bg-mv-deep-navy text-mv-sky-cyan">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-mv-deep-navy">{cat.title}</h3>
                  <ul className="mt-3 space-y-2 border-t border-border pt-3">
                    {cat.benefits.map((b) => (
                      <li key={b.id} className="flex items-start gap-2 text-sm text-mv-slate">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-mv-journey-blue" />
                        {b.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
