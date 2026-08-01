import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
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

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Viết bài mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tạo bài viết ở trạng thái Bản nháp. Chuyên mục/tóm tắt/ảnh chỉnh sau khi tạo.</p>
      </div>
      <NewsArticleCreateForm websites={websites ?? []} />
    </div>
  )
}
