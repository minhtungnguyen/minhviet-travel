import type { Metadata } from 'next'
import { Contact, CalendarClock, FilePlus2, ImageUp, Newspaper, Package, Settings as SettingsIcon, UserPlus, Users } from 'lucide-react'
import { getCurrentApplicationUser, hasPermission } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AuditQueryService } from '@/modules/audit/application/audit-query.service'
import { SupabaseAuditQueryRepository } from '@/modules/audit/infrastructure/audit-query.repository'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { FormsService } from '@/modules/forms/application/forms.service'
import { SupabaseFormsRepository } from '@/modules/forms/infrastructure/forms.repository'
import { OrganizationService } from '@/modules/organization/application/organization.service'
import { SupabaseOrganizationRepository } from '@/modules/organization/infrastructure/organization.repository'
import { lookupAuthEmails } from '@/modules/access-control/infrastructure/auth-email-lookup'
import {
  DashboardView,
  type DashboardAction,
  type DashboardActivityItem,
  type DashboardLoginItem,
  type DashboardNotificationItem,
  type DashboardStat,
} from '@/components/admin/dashboard-view'

export const metadata: Metadata = { title: 'Dashboard | Minh Việt Travel Admin' }

const ANNOUNCEMENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang hiển thị',
  INACTIVE: 'Tạm ẩn',
  ARCHIVED: 'Lưu trữ',
}

export default async function AdminDashboardPage() {
  const { actor, profile } = await getCurrentApplicationUser()
  const supabase = await getServerSupabaseClient()

  // --- Welcome card: organization name (own org needs no extra permission) ---
  let organizationName: string | null = null
  if (actor.organizationId) {
    try {
      const orgService = new OrganizationService(new SupabaseOrganizationRepository(supabase), recordAuditLog)
      const org = await orgService.getOrganization(actor, actor.organizationId)
      organizationName = org.displayName || org.legalName || null
    } catch {
      organizationName = null
    }
  }

  // --- Default website (same "first active website" convention as /admin/cms, /admin/cms/announcements) ---
  const { data: websites } = await supabase.from('websites').select('id').is('deleted_at', null).order('created_at')
  const websiteId = websites?.[0]?.id ?? null

  // --- Quick stats — every tile reflects a real table; no backing table -> "not_built", no permission -> "denied" ---
  const stats: DashboardStat[] = []

  if (!hasPermission(actor, 'forms.submission.read')) {
    stats.push({ key: 'leads', label: 'Leads', icon: Users, kind: 'denied' })
  } else if (!websiteId) {
    stats.push({ key: 'leads', label: 'Leads', icon: Users, kind: 'empty', message: 'Chưa có website nào.' })
  } else {
    const formsService = new FormsService(new SupabaseFormsRepository(supabase), supabase, recordAuditLog)
    const result = await formsService.listSubmissions(actor, websiteId, { page: 1, pageSize: 1, order: 'desc' })
    stats.push(
      result.total > 0
        ? { key: 'leads', label: 'Leads', icon: Users, kind: 'value', value: result.total, note: 'Biểu mẫu liên hệ' }
        : { key: 'leads', label: 'Leads', icon: Users, kind: 'empty', message: 'Chưa có lead nào.' },
    )
  }

  if (!hasPermission(actor, 'attraction_ticket.booking.read')) {
    stats.push({ key: 'bookings', label: 'Bookings', icon: CalendarClock, kind: 'denied' })
  } else {
    const { count } = await supabase.from('attraction_orders').select('id', { count: 'exact', head: true })
    stats.push(
      (count ?? 0) > 0
        ? { key: 'bookings', label: 'Bookings', icon: CalendarClock, kind: 'value', value: count ?? 0, note: 'Vé vui chơi' }
        : { key: 'bookings', label: 'Bookings', icon: CalendarClock, kind: 'empty', message: 'Chưa có booking nào.' },
    )
  }

  // No CRM/customer module exists yet — never mapped to user_profiles (staff accounts), that would misrepresent the number.
  stats.push({
    key: 'customers',
    label: 'Customers',
    icon: Contact,
    kind: 'not_built',
    message: 'Mô-đun quản lý khách hàng (CRM) chưa được triển khai.',
  })

  {
    // attraction_products has an open staff-read policy — no extra permission gate needed.
    const { count } = await supabase.from('attraction_products').select('id', { count: 'exact', head: true })
    stats.push(
      (count ?? 0) > 0
        ? { key: 'products', label: 'Products', icon: Package, kind: 'value', value: count ?? 0, note: 'Vé vui chơi' }
        : { key: 'products', label: 'Products', icon: Package, kind: 'empty', message: 'Chưa có sản phẩm nào.' },
    )
  }

  if (!hasPermission(actor, 'cms.page.read')) {
    stats.push({ key: 'articles', label: 'Articles', icon: Newspaper, kind: 'denied' })
  } else if (!websiteId) {
    stats.push({ key: 'articles', label: 'Articles', icon: Newspaper, kind: 'empty', message: 'Chưa có website nào.' })
  } else {
    const { count } = await supabase
      .from('cms_pages')
      .select('id', { count: 'exact', head: true })
      .eq('website_id', websiteId)
      .like('slug', 'brand/news/%')
    stats.push(
      (count ?? 0) > 0
        ? { key: 'articles', label: 'Articles', icon: Newspaper, kind: 'value', value: count ?? 0, note: 'Tin tức' }
        : { key: 'articles', label: 'Articles', icon: Newspaper, kind: 'empty', message: 'Chưa có bài viết nào.' },
    )
  }

  // --- Quick actions — only a real destination gets a Link; the rest show "Sắp triển khai" like the sidebar does ---
  const actions: DashboardAction[] = [
    { key: 'new-article', label: 'Bài viết mới', icon: FilePlus2, comingSoon: true },
    { key: 'new-lead', label: 'Lead mới', icon: UserPlus, comingSoon: true },
    { key: 'new-booking', label: 'Booking mới', icon: CalendarClock, comingSoon: true },
    { key: 'upload-media', label: 'Tải lên Media', icon: ImageUp, href: '/admin/media' },
    { key: 'settings', label: 'Cài đặt', icon: SettingsIcon, href: '/admin/settings' },
  ]

  // --- Recent activities / recent logins (both read audit_logs — hidden entirely for roles without audit.read) ---
  const canReadAudit = hasPermission(actor, 'audit.read')
  let activityItems: DashboardActivityItem[] = []
  let loginItems: DashboardLoginItem[] = []

  if (canReadAudit) {
    const auditService = new AuditQueryService(new SupabaseAuditQueryRepository(supabase))
    const recent = await auditService.listAuditLogs(actor, { page: 1, pageSize: 5, order: 'desc' })
    activityItems = recent.items.map((log) => ({
      id: log.id,
      label: log.action,
      detail: log.entityType + (log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''),
      at: new Date(log.createdAt).toLocaleString('vi-VN'),
      success: log.success,
    }))

    const recentLogins = await auditService.listAuditLogs(actor, { page: 1, pageSize: 5, order: 'desc', search: 'auth.login' })
    const emails = await lookupAuthEmails(
      recentLogins.items.map((l) => l.actorUserId).filter((id): id is string => Boolean(id)),
    )
    loginItems = recentLogins.items.map((log) => ({
      id: log.id,
      label: log.actorUserId ? emails.get(log.actorUserId) || log.actorUserId.slice(0, 8) : 'Không xác định',
      at: new Date(log.createdAt).toLocaleString('vi-VN'),
      success: log.success,
    }))
  }

  // --- Notifications (announcements) — visible to anyone who can at least read CMS, same gate as /admin/cms/announcements ---
  const canReadAnnouncements = hasPermission(actor, 'cms.announcement.update') || hasPermission(actor, 'cms.page.read')
  let notificationItems: DashboardNotificationItem[] = []
  if (canReadAnnouncements && websiteId) {
    const cmsService = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)
    const announcements = await cmsService.listAnnouncements(websiteId)
    notificationItems = announcements.slice(0, 5).map((a) => ({
      id: a.id,
      message: a.message,
      status: ANNOUNCEMENT_STATUS_LABEL[a.status] ?? a.status,
    }))
  }

  return (
    <DashboardView
      welcome={{
        displayName: profile.display_name,
        roles: actor.roles,
        organizationName,
        now: new Date().toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' }),
      }}
      stats={stats}
      actions={actions}
      activities={{ visible: canReadAudit, items: activityItems }}
      notifications={{ visible: canReadAnnouncements, items: notificationItems }}
      recentLogins={{ visible: canReadAudit, items: loginItems }}
    />
  )
}
