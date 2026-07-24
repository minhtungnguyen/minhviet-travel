import Link from 'next/link'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { Logo } from '@/components/mv/logo'
import { FacebookIcon, YoutubeIcon, LinkedinIcon } from '@/components/mv/social-icons'
import { NewsletterForm } from '@/components/homepage/newsletter-form'

const footerCols = [
  {
    heading: 'Về chúng tôi',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Tầm nhìn - Sứ mệnh', href: '/about#vision' },
      { label: 'Đội ngũ', href: '/brand/leadership' },
      { label: 'Tin tức', href: '/brand/news' },
      { label: 'Tuyển dụng', href: '/careers' },
    ],
  },
  {
    heading: 'Dịch vụ',
    links: [
      { label: 'Tour đoàn', href: '/tours?type=group' },
      { label: 'MICE & Sự kiện', href: '/mice' },
      { label: 'Dịch vụ lẻ', href: '/services' },
      { label: 'Khách sạn', href: '/hotels' },
      { label: 'Du thuyền', href: '/cruises' },
    ],
  },
  {
    heading: 'Hỗ trợ',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Điều khoản & điều kiện', href: '/policy/terms' },
      { label: 'Chính sách bảo mật', href: '/policy/privacy' },
      { label: 'Hướng dẫn thanh toán', href: '/policy/payment' },
      { label: 'Liên hệ', href: '/contact' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer>
      {/* Newsletter band — Sprint UI-02: deliberately its own light Mist
          Blue layer, not a continuation of Consultation's dark gradient
          above it or the Deep Navy footer below — the fix for "form,
          newsletter và footer nối thành một khối tối quá dài". Still
          inside the single <footer> landmark (no change to document
          structure/SEO), just visually a distinct band. */}
      <div className="border-y border-mv-border-soft bg-mv-mist-blue">
        <div className="container-mv flex flex-col items-center justify-between gap-6 py-10 lg:flex-row">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold text-mv-deep-navy">
              Đăng ký nhận bản tin
            </h2>
            <p className="mt-1.5 text-sm text-mv-slate">
              Nhận ưu đãi &amp; thông tin du lịch mới nhất từ Minh Việt Travel.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-mv-deep-navy text-white">
        <div className="container-mv py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <Logo height={44} onDark />
            <p className="mt-5 max-w-xs text-pretty text-sm leading-relaxed text-white/60">
              Công ty Cổ phần Thương mại &amp; Dịch vụ Du lịch Minh Việt — Đối tác tin cậy
              của doanh nghiệp, tổ chức và khách hàng cao cấp.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: FacebookIcon, label: 'Facebook Minh Việt Travel' },
                { Icon: YoutubeIcon, label: 'YouTube Minh Việt Travel' },
                { Icon: LinkedinIcon, label: 'LinkedIn Minh Việt Travel' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition-colors duration-mv-fast hover:bg-mv-sky-cyan hover:text-white"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-mv-sky-cyan">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors duration-mv-fast hover:text-mv-sky-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-mv-sky-cyan">
              Liên hệ 24/7
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-mv-sky-cyan" />
                Tầng 3, Tòa nhà VCCI Duyên Hải Bắc Bộ, Số 464 Lạch Tray, Gia Viên, Hải Phòng
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-mv-sky-cyan" />
                <span className="font-semibold text-white">0934 368 132</span>
                <span className="text-white/45">·</span>
                <span className="font-semibold text-white">(0225) 662 7777</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-mv-sky-cyan" /> info@minhviettravel.com
              </li>
              <li className="flex items-center gap-3">
                <Globe className="size-4 shrink-0 text-mv-sky-cyan" /> www.minhviettravel.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-mv flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Minh Việt Travel. All rights reserved.</p>
          <p>Được vận hành và phát triển bởi Minh Việt Travel.</p>
        </div>
      </div>
      </div>
    </footer>
  )
}
