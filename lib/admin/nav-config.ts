import type { AdminIconKey } from '@/components/admin/admin-icon-map'

export type AdminNavItem = {
  label: string
  href: string
  /** Resolved to a component via `ADMIN_NAV_ICONS` wherever it's rendered — see admin-icon-map.ts for why this can't be a component reference. */
  icon: AdminIconKey
  /**
   * Permission key(s) required to see this item — `null` means visible to
   * any authenticated staff member (no permission implies a gate).
   * Matching ANY key in the array is enough (mirrors `requireAnyPermission`).
   * Menu visibility is UX only — every write action behind these pages
   * still calls `requirePermission()` server-side regardless of whether
   * the menu shows the entry (docs/backend/auth/02-auth-architecture.md §7).
   */
  permission: string | string[] | null
  /** No backing module yet (Product Core / CRM / generic Booking) — render as "Sắp triển khai" instead of a link. */
  comingSoon?: boolean
}

/**
 * Single source of truth for the Admin Shell sidebar — generated from
 * `actor.permissions` at render time (`app/admin/layout.tsx`), never
 * hardcoded per-role (brief requirement #4). See docs/backend/auth/
 * 03-rbac-matrix.md §"Áp dụng vào Admin Shell" for the permission
 * mapping this mirrors.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard', permission: null },
  { label: 'Website CMS', href: '/admin/cms', icon: 'cms', permission: 'cms.page.read' },
  { label: 'Media', href: '/admin/media', icon: 'media', permission: 'media.asset.read' },
  { label: 'Popup / Thông báo', href: '/admin/cms/announcements', icon: 'announcement', permission: 'cms.announcement.update' },
  { label: 'Tin tức', href: '/admin/news', icon: 'news', permission: 'cms.page.read' },
  { label: 'SEO', href: '/admin/seo', icon: 'seo', permission: 'seo.metadata.update' },
  { label: 'Navigation Menu', href: '/admin/navigation', icon: 'navigation', permission: 'cms.navigation.update' },
  { label: 'Products', href: '/admin/products', icon: 'products', permission: null, comingSoon: true },
  { label: 'Leads', href: '/admin/leads', icon: 'leads', permission: null, comingSoon: true },
  { label: 'Bookings', href: '/admin/bookings', icon: 'bookings', permission: null, comingSoon: true },
  { label: 'Users', href: '/admin/users', icon: 'users', permission: 'user.manage' },
  { label: 'Roles & Permissions', href: '/admin/roles', icon: 'roles', permission: 'role.manage' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings', permission: 'settings.website.read' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'auditLogs', permission: 'audit.read' },
]

export function visibleNavItems(permissions: Set<string>): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => {
    if (item.permission === null) return true
    const required = Array.isArray(item.permission) ? item.permission : [item.permission]
    return required.some((p) => permissions.has(p))
  })
}
