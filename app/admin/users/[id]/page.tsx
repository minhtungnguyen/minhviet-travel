import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import { lookupAuthEmails } from '@/modules/access-control/infrastructure/auth-email-lookup'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { UserDetailPanel } from '@/components/admin/user-detail-panel'

export const metadata: Metadata = { title: 'Chi tiết người dùng | Minh Việt Travel Admin' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await resolveActor()

  if (!hasPermission(actor, 'user.manage')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new AccessControlService(new SupabaseAccessControlRepository(supabase), recordAuditLog)

  const [profile, allRoles, userRoles, websiteAccess, email] = await Promise.all([
    service.getUser(actor, id),
    service.listRoles(),
    service.listUserRoles(actor, id),
    service.listWebsiteAccess(actor, id),
    lookupAuthEmails([id]).then((m) => m.get(id) ?? ''),
  ])

  return (
    <UserDetailPanel
      profile={profile}
      email={email}
      allRoles={allRoles}
      userRoles={userRoles}
      websiteAccess={websiteAccess}
      isSelf={id === actor.userId}
    />
  )
}
