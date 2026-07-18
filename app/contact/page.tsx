import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { ContactForm } from '@/components/site/contact-form'
import { Reveal } from '@/components/mv/reveal'

export const metadata: Metadata = {
  title: 'Liên hệ | Minh Việt Travel',
  description: 'Kết nối với đội ngũ chuyên viên tư vấn giải pháp du lịch doanh nghiệp & MICE của Minh Việt Travel.',
}

const info = [
  { icon: MapPin, label: 'Địa chỉ', value: '60/384 Lạch Tray, P. Bạch Đằng, Q. Ngô Quyền, TP. Hải Phòng' },
  { icon: Phone, label: 'Hotline 24/7', value: '0934 368 132 · (0225) 662 7777' },
  { icon: Mail, label: 'Email', value: 'info@minhviettravel.com' },
  { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 7: 8:00 – 18:00' },
]

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Liên hệ"
        title="Kết nối với đội ngũ chuyên viên Minh Việt"
        description="Chia sẻ nhu cầu của bạn — chuyên viên tư vấn sẽ phản hồi trong vòng 24 giờ làm việc."
        breadcrumb="Liên hệ"
      />

      <section className="bg-background py-20 lg:py-28">
        <div className="container-mv grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-navy to-deep p-8 shadow-soft-lg sm:p-9">
              <p className="eyebrow text-[11px] font-semibold text-gold">Thông tin liên hệ</p>
              <h2 className="mt-3 font-display text-xl font-bold text-paper">Minh Việt Travel</h2>
              <ul className="mt-7 space-y-6">
                {info.map((i) => {
                  const Icon = i.icon
                  return (
                    <li key={i.label} className="flex items-start gap-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-gold">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs text-paper/50">{i.label}</p>
                        <p className="mt-0.5 text-sm font-medium text-paper">{i.value}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  )
}
