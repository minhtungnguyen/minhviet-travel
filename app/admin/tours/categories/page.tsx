import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { TourCategoryService } from '@/modules/tour-categories/application/tour-category.service'
import { SupabaseTourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { TourCategoriesPanel } from '@/components/admin/tour-categories-panel'

export const metadata: Metadata = { title: 'Danh mục tour | Minh Việt Travel Admin' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'

export default async function AdminTourCategoriesPage() {
  const actor = await resolveActor()
  const canWrite = hasPermission(actor, 'cms.page.update')
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new TourCategoryService(new SupabaseTourCategoryRepository(supabase), supabase, recordAuditLog)
  const categories = await service.listCategories(WEBSITE_ID)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Danh mục tour</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý danh mục cho tour ở /admin/tours. Một tour có thể thuộc nhiều danh mục. Xoá cứng (không có thùng rác).</p>
      </div>
      <TourCategoriesPanel websiteId={WEBSITE_ID} categories={categories} canWrite={canWrite} />
    </div>
  )
}
