'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, ChevronDown, Search, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { megaMenu } from '@/lib/site-data'
import { Logo } from '@/components/mv/logo'
import { MVButton } from '@/components/mv/mv-button'
import { LanguageSwitcher } from '@/components/site/language-switcher'

/**
 * `promo: true` drives the Offer Red treatment (`--mv-offer-red`) in both
 * the desktop nav and the mobile drawer below — TOUR gets it for
 * emphasis alongside its existing "Tours" mega menu (see
 * lib/site-data.ts), Ưu đãi keeps it as before. Everything else renders
 * with the default Deep Navy/Journey Blue treatment, including the new
 * Combo item, which intentionally has no `menu` (no dropdown content was
 * specified for it — a plain link styled like every other non-dropdown
 * item, same brand-blue hover as Sự kiện & MICE's own hover state).
 */
const navItems = [
  { label: 'Tour', href: '/tours', menu: 'Tours', promo: true },
  { label: 'Sự kiện & MICE', href: '/mice', menu: 'Doanh nghiệp & MICE' },
  { label: 'Dịch vụ', href: '/services', menu: 'Dịch vụ' },
  { label: 'Khách sạn', href: '/hotels' },
  { label: 'Du thuyền', href: '/cruises' },
  { label: 'Combo', href: '/combo' },
  { label: 'Vé máy bay', href: '/flights' },
  { label: 'Vé vui chơi', href: '/ve-vui-choi' },
  { label: 'Visa', href: '/visa' },
  { label: 'Bảo hiểm', href: '/insurance' },
  { label: 'Ưu đãi', href: '/deals', promo: true },
]

/**
 * 3-level header — Utility (contact/positioning statement/account) →
 * Brand (centered logo only — the wordmark PNG already contains the
 * "Khám phá cảm xúc bất tận" tagline, so Level 2 needs no extra text
 * node) → Main nav. Total height is kept under ~200px at `lg` because
 * `sections/hero-section.tsx` uses a hardcoded `lg:pt-40`/headline
 * offset to clear this fixed header and is out of scope to touch —
 * see CHANGELOG_UI_01.md "Hotfix — Brand Statement → Utility Bar" for
 * the exact budget breakdown.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-lg transition-shadow duration-300',
        scrolled ? 'shadow-[0_10px_40px_-18px_rgba(20,40,80,0.35)]' : 'shadow-sm',
      )}
    >
      {/* Level 1 — Utility bar. Always visible (not hidden on scroll) so
          contact/positioning/account stay reachable at every scroll
          position. 3-column grid so the Brand Statement sits exactly
          centered on the row regardless of how wide the left (hotline)
          and right (links/language/account) clusters are. */}
      <div className="hidden border-b border-border bg-secondary/60 lg:block">
        <div className="container-mv grid h-10 grid-cols-[auto_1fr_auto] items-center gap-2 text-[12px] text-muted-foreground xl:gap-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Phone className="size-3.5 text-accent" />
            <span>Hotline 24/7</span>
            <span className="font-bold text-primary">0934 368 132</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap xl:gap-2">
            {/* Sprint UI-02: Gold reserved for the MICE section itself
                (premium accent) — this bar spans 3 unrelated service
                lines, so it now reads in-palette Deep Navy / Journey Blue
                instead of the old blanket Gold treatment. */}
            <span className="h-px w-4 shrink-0 bg-mv-journey-blue/35 xl:w-6" aria-hidden />
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-mv-deep-navy xl:text-[10px]">
              Tour Thiết Kế Trọn Gói
            </span>
            <span className="size-1 shrink-0 rotate-45 bg-mv-journey-blue/60" aria-hidden />
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-mv-journey-blue xl:text-[10px]">MICE</span>
            <span className="size-1 shrink-0 rotate-45 bg-mv-journey-blue/60" aria-hidden />
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-mv-deep-navy xl:text-[10px]">
              Tour Ghép Quốc Tế
            </span>
            <span className="h-px w-4 shrink-0 bg-mv-journey-blue/35 xl:w-6" aria-hidden />
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap xl:gap-5">
            <Link href="/about" className="transition-colors hover:text-mv-sky-cyan">
              Về chúng tôi
            </Link>
            <Link href="/brand/news" className="transition-colors hover:text-mv-sky-cyan">
              Tin tức
            </Link>
            <Link href="/contact" className="transition-colors hover:text-mv-sky-cyan">
              Tư vấn
            </Link>
            <LanguageSwitcher />
            <span className="h-3.5 w-px bg-border" />
            <Link href="/login" className="transition-colors hover:text-mv-sky-cyan">
              Đăng nhập
            </Link>
            <Link href="/register" className="font-semibold text-mv-journey-blue transition-colors hover:text-mv-sky-cyan">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Level 2 — Brand: centered logo only. The wordmark PNG already
          renders the "Khám phá cảm xúc bất tận" tagline beneath the
          MINHVIET lockup, so no separate slogan text node is needed —
          growing the logo grows that tagline with it, unchanged font/
          color/style since it's the same source image. */}
      <div className="border-b border-border">
        <div className="container-mv flex items-center justify-center py-1">
          <Link href="/" aria-label="Minh Việt Travel — Trang chủ">
            <Logo height={scrolled ? 78 : 90} className="transition-all duration-300" />
          </Link>
        </div>
      </div>

      {/* Level 3 — Main navigation */}
      <div className="hidden lg:block" onMouseLeave={() => setOpenMenu(null)}>
        <div className="container-mv flex items-center justify-between">
          <nav className="flex items-center">
            {navItems.map((item) => {
              const isOpen = Boolean(item.menu && item.menu === openMenu)
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.menu ?? null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-3.5 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors',
                      item.promo
                        ? isOpen
                          ? 'text-mv-offer-red/80'
                          : 'text-mv-offer-red hover:text-mv-offer-red/80'
                        : isOpen
                          ? 'text-mv-journey-blue'
                          : 'text-foreground/80 hover:text-mv-journey-blue',
                    )}
                  >
                    {item.label}
                    {item.menu && <ChevronDown className="size-3.5" />}
                  </Link>
                </div>
              )
            })}
          </nav>
          <Link
            href="/tours"
            className="grid size-9 place-items-center rounded-lg text-foreground/80 transition-colors hover:text-mv-journey-blue"
            aria-label="Tìm kiếm tour"
          >
            <Search className="size-5" />
          </Link>
        </div>

        {/* Mega menu */}
        {openMenu && megaMenu[openMenu] && (
          <div className="absolute inset-x-0 top-full border-t border-primary/15 bg-background shadow-2xl">
            <div className="container-mv grid grid-cols-2 gap-10 py-8 lg:grid-cols-4">
              {megaMenu[openMenu].map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-primary">
                    {col.heading}
                  </h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group block"
                          onClick={() => setOpenMenu(null)}
                        >
                          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                            {link.label}
                          </span>
                          {link.desc && (
                            <span className="block text-xs text-muted-foreground">{link.desc}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile hamburger trigger — sits in the brand row on small screens */}
      <button
        className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-foreground lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở menu"
      >
        <Menu className="size-6" />
      </button>

      {/* Mobile drawer — both layers are their own top-level `fixed` element
          (viewport-relative), not nested inside a shared `fixed` wrapper via
          `absolute` + `h-full`, so the panel's height can't collapse if an
          ancestor's box height ever fails to resolve. */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[86%] max-w-sm flex-col bg-background shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo height={38} />
              <button
                className="grid size-10 place-items-center rounded-lg text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-secondary',
                    item.promo ? 'text-mv-offer-red hover:text-mv-offer-red/80' : 'text-foreground hover:text-accent',
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ngôn ngữ
              </span>
              <LanguageSwitcher />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-5">
              <MVButton href="/login" variant="outline" size="md">
                <User className="size-4" />
                Đăng nhập
              </MVButton>
              <MVButton href="/register" variant="accent" size="md">
                Đăng ký
              </MVButton>
            </div>
            <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-sm text-muted-foreground">
              <Phone className="size-4 text-accent" />
              Hotline: <span className="font-bold text-primary">0934 368 132</span>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
