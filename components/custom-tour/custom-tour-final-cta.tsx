import { ArrowUpRight, Phone } from 'lucide-react'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

export function CustomTourFinalCta() {
  return (
    <section className="border-t border-mv-border-soft bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            Hãy để Minh Việt bắt đầu từ ý tưởng của bạn.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/78 sm:text-lg">
            Chia sẻ nhu cầu, số lượng khách, thời gian và ngân sách dự kiến. Chuyên viên sẽ liên hệ để xây dựng
            chương trình phù hợp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MVButton href="#custom-tour-form" variant="gold" size="lg">
              Gửi yêu cầu thiết kế chương trình <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href="tel:0934368132" variant="outline-light" size="lg">
              <Phone className="size-4" /> Liên hệ chuyên gia
            </MVButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
