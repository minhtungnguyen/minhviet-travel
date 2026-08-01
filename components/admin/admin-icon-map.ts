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
  Search,
  Newspaper,
  Menu,
  type LucideIcon,
} from 'lucide-react'

/**
 * `lib/admin/nav-config.ts` (a Server-Component-safe module — it's also
 * imported by the Server Component `app/admin/layout.tsx`) can only carry
 * a serializable icon *key* per nav item, never a component reference:
 * `AdminShell` is a Client Component, and React Server Components cannot
 * pass a raw function across that boundary as prop data (only render it).
 * This map resolves the key back to a component wherever it's actually
 * rendered — mirrors the existing `components/homepage/icon-map.ts`
 * pattern used for the same reason.
 */
export const ADMIN_NAV_ICONS = {
  dashboard: LayoutDashboard,
  cms: FileText,
  media: ImageIcon,
  announcement: Megaphone,
  news: Newspaper,
  seo: Search,
  navigation: Menu,
  products: Package,
  leads: Users,
  bookings: CalendarClock,
  users: UserCog,
  roles: ShieldCheck,
  settings: SettingsIcon,
  auditLogs: ScrollText,
} satisfies Record<string, LucideIcon>

export type AdminIconKey = keyof typeof ADMIN_NAV_ICONS
