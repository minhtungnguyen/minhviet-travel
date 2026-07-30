import Link from 'next/link'
import type { Metadata } from 'next'
import { getCurrentApplicationUser } from '@/shared/auth/session'
import { visibleNavItems } from '@/lib/admin/nav-config'

export const metadata: Metadata = { title: 'Dashboard | Minh Việt Travel Admin' }

export default async function AdminDashboardPage() {
  const { actor, profile } = await getCurrentApplicationUser()
  const quickLinks = visibleNavItems(actor.permissions).filter((item) => item.href !== '/admin' && !item.comingSoon)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Xin chào, {profile.display_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vai trò: {actor.roles.join(', ') || 'Chưa gán vai trò'}
          {profile.last_login_at && ` · Đăng nhập gần nhất: ${new Date(profile.last_login_at).toLocaleString('vi-VN')}`}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Truy cập nhanh</h2>
        {quickLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tài khoản của bạn chưa được cấp quyền vào mục nào ngoài Dashboard.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium text-foreground">{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
