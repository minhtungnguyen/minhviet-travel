import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/**
 * Deliberately not `PageHero` — this is a conversion landing page, not a
 * standard interior page, so it skips the breadcrumb entirely and keeps
 * the eyebrow/CTA count to a minimum ("không quá nhiều badge" per brief).
 * Structurally it follows the same safe pattern as `sections/hero-section.tsx`:
 * a normal-flow content column with explicit pt/pb, image as `absolute
 * inset-0` behind it — never a fixed-height box the copy can be clipped by.
 */
export function CustomTourHero() {
  return (
    <section className="relative overflow-hidden bg-deep">
      <div className="absolute inset-0">
        <Image
          src="/enterprise-mice.webp"
          alt="Đoàn khách doanh nghiệp Minh Việt Travel trong một hành trình MICE được thiết kế riêng"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/92 via-deep/70 to-deep/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-deep/40" />
      </div>

      <div className="container-mv relative flex flex-col justify-center pt-28 pb-14 sm:pt-32 lg:min-h-[680px] lg:pt-40 lg:pb-20">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-sky-cyan">
            <span className="h-px w-10 bg-mv-sky-cyan/50" />
            Thiết kế hành trình riêng
          </p>

          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-paper sm:text-5xl lg:text-[3.5rem]">
            Không có hai hành trình giống nhau.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper/85">
            Minh Việt thiết kế chương trình riêng theo mục tiêu, ngân sách, quy mô và trải nghiệm mà bạn mong muốn.
          </p>

          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-paper/70">
            Từ tour doanh nghiệp, MICE, team building, gala dinner đến hành trình gia đình và đoàn khách riêng — mọi
            chi tiết đều được thiết kế để phù hợp với chính bạn.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MVButton href="#custom-tour-form" variant="gold" size="lg">
              Bắt đầu thiết kế hành trình <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href="#quy-trinh" variant="outline-light" size="lg">
              Xem quy trình
            </MVButton>
          </div>
        </div>
      </div>
    </section>
  )
}
