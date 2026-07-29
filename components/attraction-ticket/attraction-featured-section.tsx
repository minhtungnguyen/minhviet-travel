import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'
import { AttractionProductCard, type AttractionProductCardViewModel } from '@/components/attraction-ticket/attraction-product-card'

export function AttractionFeaturedSection({ products }: { products: AttractionProductCardViewModel[] }) {
  if (products.length === 0) return null

  const [featured, ...secondary] = products

  return (
    <section id="attraction-featured" className="scroll-mt-20 bg-mv-ice-blue/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading
          eyebrow="Vé nổi bật"
          title="Những trải nghiệm được chọn nhiều nhất"
          description="Vé điện tử, xác nhận nhanh — chọn ngày và số lượng, còn lại để Minh Việt lo."
        />

        <div className="mt-10 space-y-6">
          <Reveal>
            <AttractionProductCard product={featured} size="lg" />
          </Reveal>

          {secondary.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {secondary.map((product, index) => (
                <Reveal key={product.slug} delay={index * 60}>
                  <AttractionProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <MVButton href="/ve-vui-choi/tat-ca" variant="outline">
            Xem tất cả vé <ArrowRight className="size-4" />
          </MVButton>
        </div>
      </div>
    </section>
  )
}
