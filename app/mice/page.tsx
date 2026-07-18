import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { enterpriseSolutions, miceClientSegments } from '@/lib/site-data'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'
import { FinalCTA } from '@/components/site/final-cta'

export const metadata: Metadata = {
  title: 'Giải pháp MICE & Sự kiện doanh nghiệp | Minh Việt Travel',
  description:
    'Thiết kế riêng, vận hành trọn gói, điều phối 24/7, đạt tiêu chuẩn doanh nghiệp — giải pháp MICE toàn diện của Minh Việt Travel.',
}

const process = [
  { step: '01', title: 'Thiết kế riêng', desc: 'Khảo sát nhu cầu, ngân sách và mục tiêu để dựng đề án riêng cho từng tổ chức.' },
  { step: '02', title: 'Vận hành trọn gói', desc: 'Một đầu mối phụ trách toàn bộ vận chuyển, lưu trú, hậu cần và nhân sự sự kiện.' },
  { step: '03', title: 'Điều phối 24/7', desc: 'Đội ngũ điều hành túc trực xuyên suốt trước, trong và sau chương trình.' },
  { step: '04', title: 'Tiêu chuẩn doanh nghiệp', desc: 'Quy trình, hợp đồng, bảo hiểm và báo cáo đạt chuẩn đối tác FDI & tổ chức quốc tế.' },
]

export default function MicePage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Enterprise Travel & MICE"
        title="Giải pháp MICE & sự kiện doanh nghiệp trọn gói"
        description="Hội nghị, hội thảo, gala dinner, team building và incentive travel — dàn dựng chuyên nghiệp, đạt tiêu chuẩn doanh nghiệp và tổ chức quốc tế."
        breadcrumb="MICE"
        image="/editorial-mice.webp"
        ctas={[
          { label: 'Nhận tư vấn giải pháp MICE', href: '/contact', variant: 'gold' },
          { label: 'Gọi hotline 24/7', href: 'tel:0934368132', variant: 'outline-light' },
        ]}
      />

      {/* Solutions grid */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-mv">
          <SectionHeader
            eyebrow="Giải pháp MICE"
            title="Sáu hình thức tổ chức chủ lực"
            description="Mỗi chương trình được cá nhân hóa theo quy mô đoàn, ngành nghề và mục tiêu truyền thông của doanh nghiệp."
            className="max-w-2xl"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enterpriseSolutions.map((s) => {
              const Icon = s.icon
              return (
                <Reveal key={s.title}>
                  <div id={s.id} className="scroll-mt-28 rounded-2xl bg-card p-6 shadow-soft">
                    <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process — corporate campaign style */}
      <section className="bg-deep py-20 lg:py-28">
        <div className="container-mv">
          <SectionHeader
            eyebrow="Quy trình vận hành"
            title="Từ ý tưởng đến hiện thực, trong một quy trình khép kín"
            onDark
            className="max-w-2xl"
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <Reveal key={p.step}>
                <div className="border-t border-paper/20 pt-5">
                  <span className="font-display text-3xl font-extrabold text-gold">{p.step}</span>
                  <p className="mt-3 font-display text-lg text-paper">{p.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-paper/60">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Client segments */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-mv">
          <SectionHeader
            eyebrow="Đối tượng phục vụ"
            title="Đồng hành cùng đa dạng loại hình tổ chức"
            className="max-w-2xl"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {miceClientSegments.map((c) => {
              const Icon = c.icon
              return (
                <Reveal key={c.id}>
                  <div id={c.id} className="scroll-mt-28 rounded-2xl border border-border p-6">
                    <Icon className="size-6 text-royal" strokeWidth={1.75} />
                    <h3 className="mt-4 font-display text-base font-bold text-foreground">{c.title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <MVButton href="/contact" variant="primary" size="lg">
              Nhận tư vấn giải pháp MICE <ArrowUpRight className="size-5" />
            </MVButton>
          </div>
        </div>
      </section>

      <FinalCTA />
    </SiteChrome>
  )
}
