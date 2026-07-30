import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { SettingsForm } from '@/components/admin/settings-form'

export const metadata: Metadata = { title: 'Settings | Minh Việt Travel Admin' }

const NAMESPACE_LABEL: Record<string, string> = {
  company: 'Công ty',
  brand: 'Thương hiệu',
  website: 'Website',
  seo: 'SEO',
  analytics: 'Analytics',
  google: 'Google',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  zalo: 'Zalo',
  smtp: 'SMTP (email)',
  webhook: 'Webhook',
  ai: 'AI',
  maps: 'Maps',
  storage: 'Storage',
  cloudflare: 'Cloudflare',
  booking_policy: 'Chính sách đặt chỗ',
  cancellation_policy: 'Chính sách huỷ',
  feature_flag: 'Feature flag',
}

/** Fixed display order — matches the grouping requested for the Settings screen, not alphabetical. */
const NAMESPACE_ORDER = [
  'company', 'brand', 'website', 'seo', 'analytics', 'google', 'facebook', 'tiktok', 'zalo',
  'smtp', 'webhook', 'ai', 'maps', 'storage', 'cloudflare', 'booking_policy', 'cancellation_policy', 'feature_flag',
]

export default async function AdminSettingsPage() {
  const actor = await resolveActor()
  const canRead = hasPermission(actor, 'settings.website.read')
  const canWrite = hasPermission(actor, 'settings.website.update')
  if (!canRead && !canWrite) {
    return <AdminUnauthorized />
  }

  const service = new SettingsService(new SupabaseSettingsRepository(await getServerSupabaseClient()), recordAuditLog)
  const [definitions, resolved] = await Promise.all([
    service.listDefinitions(),
    service.resolveAll({ organizationId: actor.organizationId ?? undefined }),
  ])

  const resolvedByKey = new Map(resolved.map((r) => [r.key, r]))
  const presentNamespaces = new Set(definitions.map((d) => d.namespace))
  const namespaces = [
    ...NAMESPACE_ORDER.filter((ns) => presentNamespaces.has(ns)),
    ...[...presentNamespaces].filter((ns) => !NAMESPACE_ORDER.includes(ns)).sort(),
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Áp dụng theo phạm vi toàn tổ chức. Giá trị bí mật (mật khẩu SMTP, API key AI...) không lưu ở đây — cấu hình qua biến môi trường server.
        </p>
      </div>

      {namespaces.map((ns) => {
        const items = definitions
          .filter((d) => d.namespace === ns)
          .map((d) => ({ definition: d, resolved: resolvedByKey.get(d.key) }))
          .filter((x): x is { definition: typeof x.definition; resolved: NonNullable<typeof x.resolved> } => Boolean(x.resolved))

        return (
          <section key={ns} className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-foreground">{NAMESPACE_LABEL[ns] ?? ns}</h2>
            <SettingsForm items={items} canWrite={canWrite} organizationId={actor.organizationId} />
          </section>
        )
      })}
    </div>
  )
}
