import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Activity, Bell, Building2, LogIn, ShieldAlert } from 'lucide-react'

/**
 * Every field here is data the caller (`app/admin/page.tsx`) already
 * resolved from the database — this component only renders it. Kept as
 * a plain Server Component (no 'use client', no interactivity needed)
 * so it can also be rendered by a throwaway QA harness with mock props
 * for responsive screenshots, without touching auth/DB.
 */

export type DashboardStatState =
  | { kind: 'value'; value: number; note?: string }
  | { kind: 'empty'; message: string }
  | { kind: 'denied' }
  | { kind: 'not_built'; message: string }

export type DashboardStat = {
  key: string
  label: string
  icon: LucideIcon
} & DashboardStatState

export type DashboardAction = {
  key: string
  label: string
  icon: LucideIcon
  href?: string
  comingSoon?: boolean
}

export type DashboardActivityItem = { id: string; label: string; detail: string; at: string; success: boolean }
export type DashboardNotificationItem = { id: string; message: string; status: string }
export type DashboardLoginItem = { id: string; label: string; at: string; success: boolean }

export type DashboardViewProps = {
  welcome: { displayName: string; roles: string[]; organizationName: string | null; now: string }
  stats: DashboardStat[]
  actions: DashboardAction[]
  activities: { visible: boolean; items: DashboardActivityItem[] }
  notifications: { visible: boolean; items: DashboardNotificationItem[] }
  recentLogins: { visible: boolean; items: DashboardLoginItem[] }
}

function StatTile({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{stat.label}</p>
      {stat.kind === 'value' && (
        <>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value.toLocaleString('vi-VN')}</p>
          {stat.note && <p className="mt-1 text-[11px] text-muted-foreground/70">{stat.note}</p>}
        </>
      )}
      {stat.kind === 'empty' && <p className="mt-1 text-sm text-muted-foreground">{stat.message}</p>}
      {stat.kind === 'not_built' && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground/70">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
            Sắp triển khai
          </span>
        </p>
      )}
      {stat.kind === 'denied' && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground/70">
          <ShieldAlert className="size-3.5" />
          Không có quyền xem
        </p>
      )}
    </div>
  )
}

function ActionTile({ action }: { action: DashboardAction }) {
  const Icon = action.icon
  if (action.comingSoon || !action.href) {
    return (
      <span className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-4 text-center opacity-50">
        <Icon className="size-5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-secondary-foreground">
          Sắp triển khai
        </span>
      </span>
    )
  }
  return (
    <Link
      href={action.href}
      className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <Icon className="size-5 text-primary" />
      <span className="text-xs font-medium text-foreground">{action.label}</span>
    </Link>
  )
}

function EmptyRow({ message }: { message: string }) {
  return <p className="px-1 py-6 text-center text-sm text-muted-foreground">{message}</p>
}

export function DashboardView({ welcome, stats, actions, activities, notifications, recentLogins }: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Xin chào, {welcome.displayName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {welcome.roles.length > 0 ? (
                welcome.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Chưa gán vai trò</span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-3.5" />
              {welcome.organizationName ?? 'Chưa có tổ chức'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{welcome.now}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Số liệu nhanh</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatTile key={stat.key} stat={stat} />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) => (
            <ActionTile key={action.key} action={action} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activities */}
        {activities.visible && (
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="size-4 text-primary" />
              Hoạt động gần đây
            </h2>
            {activities.items.length === 0 ? (
              <EmptyRow message="Chưa có hoạt động nào được ghi nhận." />
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {activities.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div>
                      <p className="font-mono text-xs text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.at}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Notifications */}
        {notifications.visible && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="size-4 text-primary" />
              Thông báo
            </h2>
            {notifications.items.length === 0 ? (
              <EmptyRow message="Chưa có thông báo/popup nào." />
            ) : (
              <ul className="mt-3 space-y-2.5">
                {notifications.items.map((item) => (
                  <li key={item.id} className="rounded-lg bg-secondary/40 p-3 text-sm">
                    <p className="text-foreground">{item.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{item.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Recent logins */}
      {recentLogins.visible && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <LogIn className="size-4 text-primary" />
            Lượt đăng nhập gần đây
          </h2>
          {recentLogins.items.length === 0 ? (
            <EmptyRow message="Chưa có lượt đăng nhập nào được ghi nhận." />
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {recentLogins.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.success ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Thành công</span>
                    ) : (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">Thất bại</span>
                    )}
                    {item.at}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
