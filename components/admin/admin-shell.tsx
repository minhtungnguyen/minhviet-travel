'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/mv/logo'
import { LogoutButton } from '@/components/admin/logout-button'
import type { AdminNavItem } from '@/lib/admin/nav-config'

function NavLink({ item, active, onClick }: { item: AdminNavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon
  if (item.comingSoon) {
    return (
      <span className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50">
        <Icon className="size-4.5 shrink-0" />
        {item.label}
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
          Sắp ra mắt
        </span>
      </span>
    )
  }
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary/70 hover:text-foreground',
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {item.label}
    </Link>
  )
}

function SidebarContent({ navItems, pathname, onNavigate }: { navItems: AdminNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <Logo height={30} />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>
      <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
        Minh Việt Travel Operating System
      </div>
    </>
  )
}

export function AdminShell({
  navItems,
  displayName,
  roles,
  children,
}: {
  navItems: AdminNavItem[]
  displayName: string
  roles: string[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const breadcrumbLabel = navItems.find((item) => item.href !== '/admin' && pathname.startsWith(item.href))?.label

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <SidebarContent navItems={navItems} pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-2xl">
            <div className="flex justify-end p-2">
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" className="p-1 text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className="text-foreground lg:hidden"
          >
            <Menu className="size-6" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            {breadcrumbLabel && (
              <>
                <ChevronRight className="size-3.5" />
                <span className="font-medium text-foreground">{breadcrumbLabel}</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roles.join(', ') || 'Chưa gán vai trò'}</p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
