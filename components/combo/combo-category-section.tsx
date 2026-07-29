import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { ComboVisualTile } from '@/components/combo/combo-visual-tile'
import type { ComboCategory } from '@/types/combo'

/** Section 02 "Chọn theo nhu cầu" — visual category tiles, no icons. */
export function ComboCategorySection({ categories }: { categories: ComboCategory[] }) {
  if (categories.length === 0) return null

  return (
    <section className="bg-mv-combo-sand/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Chọn theo nhu cầu" title="Mỗi chuyến đi một mục đích" />

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={index * 50}>
              <ComboVisualTile
                image={category.image}
                title={category.label}
                subtitle={category.description}
                href={category.href}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
