import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { AttractionProductCard, type AttractionProductCardViewModel } from '@/components/attraction-ticket/attraction-product-card'

export type AttractionCategoryRail = {
  slug: string
  name: string
  products: AttractionProductCardViewModel[]
}

/**
 * "DẢI theo category" (docs/design/mv-ticket/02-homepage-and-listing-
 * concept.md §1.2, dải 3) — one horizontal rail per category that actually
 * has ≥1 real product tagged (attraction_product_categories, migration
 * 0018/seed 0008). Categories with 0 products are filtered out before this
 * component ever renders them — no empty rail, no "coming soon" filler
 * (honesty discipline, 01-design-direction.md §7).
 */
export function AttractionCategorySection({ rails }: { rails: AttractionCategoryRail[] }) {
  const nonEmptyRails = rails.filter((rail) => rail.products.length > 0)
  if (nonEmptyRails.length === 0) return null

  return (
    <section className="border-t border-border bg-mv-ice-blue/30 py-14 lg:py-20">
      <div className="container-mv">
        <SectionHeading eyebrow="Theo loại hình" title="Chọn theo điều bạn thích" description="Vé được nhóm theo đúng loại hình trải nghiệm — không phải mọi thứ trộn chung một danh sách." />

        <div className="mt-8 space-y-10">
          {nonEmptyRails.map((rail) => (
            <div key={rail.slug}>
              <h3 className="font-display text-lg font-bold text-mv-deep-navy">{rail.name}</h3>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {rail.products.map((product, index) => (
                  <Reveal key={product.slug} delay={index * 60} className="w-[68vw] shrink-0 sm:w-64">
                    <AttractionProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
