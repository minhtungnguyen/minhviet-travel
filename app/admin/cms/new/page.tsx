import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { CmsPageCreateForm } from '@/components/admin/cms-page-create-form'

export const metadata: Metadata = { title: 'Tạo trang mới | Minh Việt Travel Admin' }

export default async function AdminCmsNewPage() {
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
        <h1 className="font-display text-2xl font-bold text-foreground">Tạo trang mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tạo một trang CMS mới ở trạng thái Bản nháp.</p>
      </div>
      <CmsPageCreateForm websites={websites ?? []} />
    </div>
  )
}
