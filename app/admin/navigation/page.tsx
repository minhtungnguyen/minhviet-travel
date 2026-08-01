import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { NavigationEditor } from '@/components/admin/navigation-editor'

export const metadata: Metadata = { title: 'Navigation Menu | Minh Việt Travel Admin' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const MENU_KEYS = ['HEADER', 'FOOTER', 'MOBILE', 'SERVICE', 'LEGAL', 'SOCIAL', 'ANNOUNCEMENT_BAR'] as const

export default async function AdminNavigationPage({ searchParams }: { searchParams: Promise<{ menuId?: string }> }) {
  const params = await searchParams
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.navigation.update')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new NavigationService(new SupabaseNavigationRepository(supabase), supabase, recordAuditLog)
  const menus = await service.listMenus(WEBSITE_ID)
  const selectedMenu = menus.find((m) => m.id === params.menuId) ?? menus[0] ?? null
  const items = selectedMenu ? await service.listItems(selectedMenu.id) : []

  const { data: pages } = await supabase
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', WEBSITE_ID)
    .is('deleted_at', null)
    .order('slug')

  const missingKeys = MENU_KEYS.filter((key) => !menus.some((m) => m.key === key && m.locale === 'vi'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Navigation Menu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Header, Footer và các menu khác. Lưu áp dụng ngay lên site.</p>
      </div>

      <NavigationEditor
        websiteId={WEBSITE_ID}
        menus={menus}
        selectedMenu={selectedMenu}
        items={items}
        pages={pages ?? []}
        missingKeys={[...missingKeys]}
      />
    </div>
  )
}
