import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Package,
  Users,
  CalendarClock,
  UserCog,
  ShieldCheck,
  Settings as SettingsIcon,
  ScrollText,
  Megaphone,
} from 'lucide-react'

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
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
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, permission: null },
  { label: 'Website CMS', href: '/admin/cms', icon: FileText, permission: 'cms.page.read' },
  { label: 'Media', href: '/admin/media', icon: ImageIcon, permission: 'media.asset.read' },
  { label: 'Popup / Thông báo', href: '/admin/cms/announcements', icon: Megaphone, permission: 'cms.announcement.update' },
  { label: 'Products', href: '/admin/products', icon: Package, permission: null, comingSoon: true },
  { label: 'Leads', href: '/admin/leads', icon: Users, permission: null, comingSoon: true },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarClock, permission: null, comingSoon: true },
  { label: 'Users', href: '/admin/users', icon: UserCog, permission: 'user.manage' },
  { label: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck, permission: 'role.manage' },
  { label: 'Settings', href: '/admin/settings', icon: SettingsIcon, permission: 'settings.website.read' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, permission: 'audit.read' },
]

export function visibleNavItems(permissions: Set<string>): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => {
    if (item.permission === null) return true
    const required = Array.isArray(item.permission) ? item.permission : [item.permission]
    return required.some((p) => permissions.has(p))
  })
}
