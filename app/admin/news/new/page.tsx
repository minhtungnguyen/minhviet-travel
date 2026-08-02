import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { NewsArticleCreateForm } from '@/components/admin/news-article-create-form'

export const metadata: Metadata = { title: 'Viết bài mới | Minh Việt Travel Admin' }

export default async function AdminNewsNewPage() {
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.create')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const { data: websites } = await supabase
    .from('websites')
    .select('id, name, domain')
    .is('deleted_at', null)
    .order('created_at')

  const categoryService = new NewsCategoryService(new SupabaseNewsCategoryRepository(supabase), supabase, recordAuditLog)
  const categories = websites?.[0]?.id ? await categoryService.listCategories(websites[0].id) : []

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Viết bài mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tạo bài viết ở trạng thái Bản nháp. Tóm tắt/ảnh/nhãn chỉnh sau khi tạo.</p>
      </div>
      <NewsArticleCreateForm websites={websites ?? []} categories={categories} />
    </div>
  )
}
