import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

/**
 * Real photography only — no invented client names or logos. Captions stay
 * neutral (event type, not company) until specific case studies are cleared
 * for publication; see CUSTOM_TOUR_LANDING_PAGE.md "Remaining CMS work".
 */
const GALLERY = [
  { image: '/enterprise-mice.webp', caption: 'Gala dinner doanh nghiệp', span: 'lg:col-span-2 lg:row-span-2' },
  { image: '/brand-leadership.webp', caption: 'Ký kết hợp tác chiến lược', span: '' },
  { image: '/brand-signing.webp', caption: 'Hội nghị đối tác', span: '' },
  { image: '/images/hero/ha-long-bay.jpg', caption: 'Company Trip trên du thuyền', span: '' },
  { image: '/brand-group.webp', caption: 'Team building gắn kết đội ngũ', span: '' },
] as const

export function CaseStudyGallery() {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Hình ảnh thực tế"
          title="Những gì Minh Việt từng dựng lên"
          description="Một phần hình ảnh từ các chương trình doanh nghiệp và MICE đã triển khai."
          className="max-w-2xl"
        />

        <Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
            {GALLERY.map((g) => (
              <div
                key={g.image + g.caption}
                className={`group relative aspect-square overflow-hidden rounded-2xl ${g.span}`}
              >
                <Image
                  src={g.image}
                  alt={g.caption}
                  fill
                  sizes="(min-width: 1024px) 25vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/80 via-transparent to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">{g.caption}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <MVButton href="/mice" variant="outline" size="lg">
            Xem năng lực tổ chức <ArrowUpRight className="size-5" />
          </MVButton>
        </div>
      </div>
    </section>
  )
}
