import { ArrowUpRight, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { Reveal } from '@/components/mv/reveal'

export function FinalCTA() {
  return (
    <section className="bg-deep py-20 lg:py-24">
      <div className="container-mv">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 rounded-3xl border border-paper/10 bg-gradient-to-br from-navy to-deep p-10 sm:p-14 lg:flex-row lg:items-center lg:p-16">
            <div className="max-w-xl">
              <p className="eyebrow text-[11px] font-semibold text-gold">
                Sẵn sàng đồng hành
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl">
                Nâng tầm hành trình doanh nghiệp của bạn cùng Minh Việt
              </h2>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-paper/70">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng thiết kế giải pháp du lịch,
                sự kiện và MICE phù hợp với quy mô và mục tiêu của tổ chức bạn.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-5 sm:flex-row sm:items-center">
              <MVButton href="/contact" variant="gold" size="lg">
                Nhận tư vấn giải pháp <ArrowUpRight className="size-5" />
              </MVButton>
              <a
                href="tel:0934368132"
                className="flex items-center gap-2.5 text-sm font-semibold text-paper"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-paper/30">
                  <Phone className="size-4" />
                </span>
                <span>
                  Hotline 24/7
                  <span className="block text-base text-gold">0934 368 132</span>
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
