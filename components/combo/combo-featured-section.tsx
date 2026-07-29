import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'
import { ComboCard } from '@/components/combo/combo-card'
import type { ComboItem } from '@/types/combo'

/**
 * Section 01 "Combo nổi bật" — one large featured card plus secondary
 * cards, modeled on `components/homepage/travel-inspiration-hub.tsx`'s
 * featured+supporting composition (the only existing precedent for this
 * layout in the codebase). Shows a curated 6–8, not the full catalog —
 * "Xem tất cả Combo" is the escape hatch to `/combo/tat-ca` so this
 * section stays storytelling-first, not a product grid.
 */
export function ComboFeaturedSection({ combos }: { combos: ComboItem[] }) {
  if (combos.length === 0) return null

  const [featured, ...secondary] = combos

  return (
    <section id="combo-featured" className="scroll-mt-20 bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading
          eyebrow="Combo nổi bật"
          title="Những hành trình được chọn nhiều nhất"
          description="Mỗi Combo đã gộp sẵn di chuyển, lưu trú và lịch trình — bạn chỉ cần chọn ngày đi."
        />

        <div className="mt-10 space-y-6">
          <Reveal>
            <ComboCard combo={featured} featured />
          </Reveal>

          {secondary.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((combo, index) => (
                <Reveal key={combo.id} delay={index * 60}>
                  <ComboCard combo={combo} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <MVButton href="/combo/tat-ca" variant="outline">
            Xem tất cả Combo <ArrowRight className="size-4" />
          </MVButton>
        </div>
      </div>
    </section>
  )
}
