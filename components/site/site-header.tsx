'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, ChevronDown, Search, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { megaMenu } from '@/lib/site-data'
import { Logo } from '@/components/mv/logo'
import { MVButton } from '@/components/mv/mv-button'

const navItems = [
  { label: 'Tour', href: '/tours', menu: 'Tours' },
  { label: 'Sự kiện & MICE', href: '/mice', menu: 'Doanh nghiệp & MICE' },
  { label: 'Dịch vụ', href: '/services', menu: 'Dịch vụ' },
  { label: 'Khách sạn', href: '/hotels' },
  { label: 'Du thuyền', href: '/cruises' },
  { label: 'Vé máy bay', href: '/flights' },
  { label: 'Vé vui chơi', href: '/tickets' },
  { label: 'Visa', href: '/visa' },
  { label: 'Ưu đãi', href: '/deals' },
]

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
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 shadow-[0_10px_40px_-18px_rgba(20,40,80,0.35)] backdrop-blur-lg'
          : 'bg-background/95 shadow-sm backdrop-blur-lg',
      )}
    >
      {/* Utility bar */}
      <div
        className={cn(
          'hidden overflow-hidden border-b border-border bg-secondary/60 transition-all duration-300 lg:block',
          scrolled ? 'h-0 border-transparent opacity-0' : 'opacity-100',
        )}
      >
        <div className="container-mv flex h-10 items-center justify-between text-[13px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 text-accent" />
            <span>Hotline 24/7</span>
            <span className="font-bold text-primary">0934 368 132</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="transition-colors hover:text-primary">
              Về chúng tôi
            </Link>
            <Link href="/brand/news" className="transition-colors hover:text-primary">
              Tin tức
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-mv flex h-16 items-center justify-between gap-4 lg:h-[74px]">
        <Link href="/" aria-label="Minh Việt Travel — Trang chủ">
          <Logo height={scrolled ? 42 : 50} className="transition-all" />
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Persistent contact — unlike the utility bar above, this never
              disappears on scroll, so a way to reach a human stays visible
              at every scroll position (Volume 02 Ch.2 Principle 4). */}
          <a
            href="tel:0934368132"
            className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary md:flex"
          >
            <Phone className="size-4 text-accent" />
            0934 368 132
          </a>
          <div className="hidden items-center gap-2 lg:flex">
            <MVButton href="/login" variant="ghost" size="sm">
              <User className="size-4" />
              Đăng nhập
            </MVButton>
            <MVButton href="/register" variant="gold" size="sm">
              Đăng ký
            </MVButton>
          </div>
          <button
            className="grid size-10 place-items-center rounded-lg text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/* Nav row */}
      <div
        className="hidden border-t border-border lg:block"
        onMouseLeave={() => setOpenMenu(null)}
      >
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
                    'flex items-center gap-1 px-3.5 py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors',
                    item.menu && item.menu === openMenu
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-primary',
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
            className="grid size-9 place-items-center rounded-lg text-foreground/80 transition-colors hover:text-primary"
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
                          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo height={40} />
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
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-5">
              <MVButton href="/login" variant="outline" size="md">
                Đăng nhập
              </MVButton>
              <MVButton href="/register" variant="gold" size="md">
                Đăng ký
              </MVButton>
            </div>
            <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-sm text-muted-foreground">
              <Phone className="size-4 text-accent" />
              Hotline: <span className="font-bold text-primary">0934 368 132</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
