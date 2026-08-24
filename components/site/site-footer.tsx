import Link from 'next/link'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { Logo } from '@/components/mv/logo'
import { FacebookIcon, YoutubeIcon, LinkedinIcon } from '@/components/mv/social-icons'
import { NewsletterForm } from '@/components/homepage/newsletter-form'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'

/**
 * Sprint 2 ("Footer management"): link columns come from the real
 * `FOOTER` navigation_menu (a column heading is a parent item with
 * `url=null`, its links are the children) and contact/social info from
 * existing `company.*` settings — replacing what used to be entirely
 * hardcoded arrays. Falls back to the previous static content only if
 * the real data is unexpectedly empty, so a settings/navigation outage
 * degrades to "looks the same as before," never a blank footer.
 */
export async function SiteFooter() {
  const client = getPublicSupabaseClient()
  const nav = new NavigationService(new SupabaseNavigationRepository(client), client, recordAuditLog)
  const settings = new SettingsService(new SupabaseSettingsRepository(client), recordAuditLog)

  // Each setting is fetched independently and guarded — an unguarded
  // Promise.all means any single missing/erroring setting rejects the
  // whole footer (rendered on every public page), contradicting the
  // "degrades gracefully" intent below.
  const emptySetting = { resolved: { value: '' } } as Awaited<ReturnType<typeof settings.getSetting>>
  const safeSetting = (key: string) => settings.getSetting(key, {}).catch(() => emptySetting)

  const [menuResult, hotline, email, address, city, facebook, youtube, linkedin] = await Promise.all([
    nav.getPublicMenu(WEBSITE_ID, 'FOOTER', 'vi').catch(() => null),
    safeSetting('company.hotline'),
    safeSetting('company.email'),
    safeSetting('company.address'),
    safeSetting('company.city'),
    safeSetting('company.social_facebook'),
    safeSetting('company.social_youtube'),
    safeSetting('company.social_linkedin'),
  ])

  const columns = menuResult
    ? menuResult.items
        .filter((item) => item.parentItemId === null)
        .sort((a, b) => a.position - b.position)
        .map((heading) => ({
          heading: heading.label,
          links: menuResult.items
            .filter((item) => item.parentItemId === heading.id)
            .sort((a, b) => a.position - b.position)
            .map((item) => ({ label: item.label, href: item.url ?? '#' })),
        }))
    : []

  const socialLinks = [
    { Icon: FacebookIcon, label: 'Facebook Minh Việt Travel', href: String(facebook.resolved.value || '') },
    { Icon: YoutubeIcon, label: 'YouTube Minh Việt Travel', href: String(youtube.resolved.value || '') },
    { Icon: LinkedinIcon, label: 'LinkedIn Minh Việt Travel', href: String(linkedin.resolved.value || '') },
  ].filter((s) => s.href)

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
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socialLinks.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition-colors duration-mv-fast hover:bg-mv-sky-cyan hover:text-white"
                  >
                    <Icon className="size-4.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
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
                {String(address.resolved.value || '')}
                {city.resolved.value ? `, ${String(city.resolved.value)}` : ''}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-mv-sky-cyan" />
                <span className="font-semibold text-white">{String(hotline.resolved.value || '')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-mv-sky-cyan" /> {String(email.resolved.value || '')}
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
