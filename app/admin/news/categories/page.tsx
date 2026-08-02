import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { NewsCategoriesPanel } from '@/components/admin/news-categories-panel'

export const metadata: Metadata = { title: 'Danh mục tin tức | Minh Việt Travel Admin' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'

export default async function AdminNewsCategoriesPage() {
  const actor = await resolveActor()
  const canWrite = hasPermission(actor, 'cms.page.update')
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new NewsCategoryService(new SupabaseNewsCategoryRepository(supabase), supabase, recordAuditLog)
  const categories = await service.listCategories(WEBSITE_ID)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Danh mục tin tức</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý danh mục cho bài viết ở /admin/news. Xoá cứng (không có thùng rác ở V1).</p>
      </div>
      <NewsCategoriesPanel websiteId={WEBSITE_ID} categories={categories} canWrite={canWrite} />
    </div>
  )
}
