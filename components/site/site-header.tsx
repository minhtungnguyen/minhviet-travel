'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, ChevronDown, Search, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { megaMenu } from '@/lib/site-data'
import { Logo } from '@/components/mv/logo'
import { MVButton } from '@/components/mv/mv-button'
import { LanguageSwitcher } from '@/components/site/language-switcher'

const navItems = [
  { label: 'Tour Thiết Kế', href: '/tours', menu: 'Tours' },
  { label: 'Sự kiện & MICE', href: '/mice', menu: 'Doanh nghiệp & MICE' },
  { label: 'Dịch vụ', href: '/services', menu: 'Dịch vụ' },
  { label: 'Khách sạn', href: '/hotels' },
  { label: 'Du thuyền', href: '/cruises' },
  { label: 'Vé máy bay', href: '/flights' },
  { label: 'Vé vui chơi', href: '/tickets' },
  { label: 'Visa', href: '/visa' },
  { label: 'Bảo hiểm', href: '/insurance' },
  { label: 'Ưu đãi', href: '/deals', promo: true },
]

/**
 * 3-level header — Utility (contact/account/language) → Brand (centered
 * logo + positioning line) → Main nav. Total height is deliberately kept
 * at ~160px at the `lg` breakpoint (unchanged from the previous 1-level-
 * shorter header) because `sections/hero-section.tsx` uses a hardcoded
 * `lg:pt-40` to clear this fixed header and is out of scope to touch —
 * see Sprint UI-01.1 changelog entry for the exact budget breakdown.
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
          contact/account/language stay reachable at every scroll position. */}
      <div className="hidden border-b border-border bg-secondary/60 lg:block">
        <div className="container-mv flex h-9 items-center justify-between text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 text-accent" />
            <span>Hotline 24/7</span>
            <span className="font-bold text-primary">0934 368 132</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/about" className="transition-colors hover:text-accent">
              Về chúng tôi
            </Link>
            <Link href="/brand/news" className="transition-colors hover:text-accent">
              Tin tức
            </Link>
            <Link href="/contact" className="transition-colors hover:text-accent">
              Tư vấn
            </Link>
            <LanguageSwitcher />
            <span className="h-3.5 w-px bg-border" />
            <Link href="/login" className="transition-colors hover:text-accent">
              Đăng nhập
            </Link>
            <Link href="/register" className="font-semibold text-accent transition-colors hover:text-royal">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Level 2 — Brand: centered logo + positioning statement, no hotline. */}
      <div className="border-b border-border">
        <div className="container-mv flex flex-col items-center gap-1 py-1.5 lg:py-2">
          <Link href="/" aria-label="Minh Việt Travel — Trang chủ">
            <Logo height={scrolled ? 48 : 60} className="transition-all duration-300" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 px-4 text-center leading-none">
            <span className="hidden h-px w-8 bg-gold/50 sm:block" aria-hidden />
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-primary sm:text-[11px]">
              Tour Thiết Kế Trọn Gói
            </span>
            <span className="size-1 shrink-0 rotate-45 bg-gold/70" aria-hidden />
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-gold sm:text-[11px]">
              MICE
            </span>
            <span className="size-1 shrink-0 rotate-45 bg-gold/70" aria-hidden />
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-primary sm:text-[11px]">
              Tour Ghép Quốc Tế
            </span>
            <span className="hidden h-px w-8 bg-gold/50 sm:block" aria-hidden />
          </div>
        </div>
      </div>

      {/* Level 3 — Main navigation */}
      <div className="hidden lg:block" onMouseLeave={() => setOpenMenu(null)}>
        <div className="container-mv flex items-center justify-between">
          <nav className="flex items-center">
            {navItems.map((item) => (
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
                      ? 'text-destructive hover:text-destructive/80'
                      : item.menu && item.menu === openMenu
                        ? 'text-accent'
                        : 'text-foreground/80 hover:text-accent',
                  )}
                >
                  {item.label}
                  {item.menu && <ChevronDown className="size-3.5" />}
                </Link>
              </div>
            ))}
          </nav>
          <Link
            href="/tours"
            className="grid size-9 place-items-center rounded-lg text-foreground/80 transition-colors hover:text-accent"
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
                    item.promo ? 'text-destructive hover:text-destructive' : 'text-foreground hover:text-accent',
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
