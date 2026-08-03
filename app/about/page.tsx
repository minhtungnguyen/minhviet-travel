import type { Metadata } from 'next'
import Image from 'next/image'
import { ShieldCheck, Target, Compass } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { WhyChoose } from '@/components/site/why-choose'
import { Partners } from '@/components/site/partners'
import { FinalCTA } from '@/components/site/final-cta'

export const metadata: Metadata = {
  title: 'Giới thiệu | Minh Việt Travel',
  description:
    'Minh Việt Travel — đối tác du lịch, sự kiện và MICE tin cậy của doanh nghiệp, tổ chức và khách hàng cao cấp từ 2013.',
}

const pillars = [
  { icon: Target, title: 'Sứ mệnh', desc: 'Kiến tạo hành trình trọn vẹn, nâng tầm trải nghiệm cho mọi tổ chức chúng tôi đồng hành.' },
  { icon: Compass, title: 'Tầm nhìn', desc: 'Trở thành nền tảng du lịch doanh nghiệp AI-first hàng đầu Việt Nam.' },
  { icon: ShieldCheck, title: 'Giá trị cốt lõi', desc: 'Chuyên nghiệp, minh bạch và cam kết chất lượng trong từng chi tiết vận hành.' },
]

export default function AboutPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Về Minh Việt"
        title="Đối tác du lịch doanh nghiệp tin cậy từ 2013"
        description="Minh Việt Travel đồng hành cùng doanh nghiệp, tổ chức, khu công nghiệp FDI và cơ quan nhà nước trong các hành trình du lịch, công tác và sự kiện quy mô lớn."
        breadcrumb="Giới thiệu"
        image="/brand-group.webp"
      />

      {/* Story */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-mv grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft-lg">
              <Image src="/brand-signing.webp" alt="Lễ ký kết hợp tác chiến lược của Minh Việt Travel" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <SectionHeader
              eyebrow="Dấu ấn Minh Việt"
              title="Hơn một thập kỷ kiến tạo hành trình"
              description="Từ một công ty lữ hành khu vực Hải Phòng, Minh Việt Travel phát triển thành đối tác du lịch doanh nghiệp toàn diện — phục vụ hơn 5.000 tổ chức, từ khu công nghiệp FDI đến cơ quan nhà nước và tập đoàn đa quốc gia."
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {pillars.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title} className="border-t border-border pt-4">
                    <Icon className="size-5 text-primary" strokeWidth={1.75} />
                    <p className="mt-3 font-display text-base font-bold text-foreground">{p.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Capability stats */}
      <WhyChoose />

      {/* Leadership */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-mv grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <SectionHeader
              eyebrow="Lãnh đạo & chuyên gia"
              title="Dẫn dắt bởi tầm nhìn AI-first"
              description="Ban điều hành Minh Việt quy tụ chuyên gia du lịch, vận hành sự kiện và công nghệ — cùng theo đuổi mục tiêu chuyển đổi số ngành du lịch doanh nghiệp."
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft-lg">
              <Image src="/brand-leadership.webp" alt="Ban lãnh đạo Minh Việt Travel" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clients & partners */}
      <Partners />

      <FinalCTA />
    </SiteChrome>
  )
}
