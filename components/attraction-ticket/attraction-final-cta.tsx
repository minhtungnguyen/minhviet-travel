import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'

/**
 * Repurposed for Corporate Booking (D4, 14-implementation-plan.md §1) —
 * this used to be a generic "chưa tìm thấy vé phù hợp → /contact" banner,
 * which `02-homepage-and-listing-concept.md` §1.1 flagged as the wrong CTA
 * for retail customers. Kept the same `bg-gradient-mv-consultation` visual
 * language (no new section), just retargeted copy + href toward group/
 * corporate ticket requests, which now have a real destination:
 * `/ve-vui-choi/dat-doan`.
 */
export function AttractionFinalCta() {
  return (
    <section className="bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
            Đặt vé cho đoàn hoặc doanh nghiệp?
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-paper/78 sm:text-lg">
            Số lượng lớn, lịch trình riêng hoặc nhu cầu team building — đội ngũ Minh Việt tư vấn báo giá phù hợp.
          </p>
          <div className="mt-8 flex justify-center">
            <MVButton href="/ve-vui-choi/dat-doan" variant="accent" size="lg">
              Nhận báo giá đoàn/doanh nghiệp <ArrowUpRight className="size-5" />
            </MVButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
