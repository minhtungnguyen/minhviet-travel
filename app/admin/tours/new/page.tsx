import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { TourCreateForm } from '@/components/admin/tour-create-form'

export const metadata: Metadata = { title: 'Tạo tour mới | Minh Việt Travel Admin' }

export default async function AdminTourNewPage() {
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
        <h1 className="font-display text-2xl font-bold text-foreground">Tạo tour mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tạo tour ở trạng thái Bản nháp. Danh mục/điểm đến/lịch trình/khởi hành chỉnh sau khi tạo.</p>
      </div>
      <TourCreateForm websites={websites ?? []} />
    </div>
  )
}
