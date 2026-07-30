'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import {
  updateAccountStatusAction,
  assignRoleAction,
  revokeRoleAction,
} from '@/app/admin/users/actions'
import type { AccountStatus, Role, UserProfile, UserRole, UserWebsiteAccess } from '@/modules/access-control/domain/types'

const STATUS_OPTIONS: AccountStatus[] = ['INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'TERMINATED']
const STATUS_LABEL: Record<AccountStatus, string> = {
  INVITED: 'Đã mời',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khoá',
  DISABLED: 'Vô hiệu hoá',
  TERMINATED: 'Đã chấm dứt',
}

export function UserDetailPanel({
  profile,
  email,
  allRoles,
  userRoles,
  websiteAccess,
  isSelf,
}: {
  profile: UserProfile
  email: string
  allRoles: Role[]
  userRoles: UserRole[]
  websiteAccess: UserWebsiteAccess[]
  isSelf: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<AccountStatus>(profile.accountStatus)
  const [error, setError] = useState<string | null>(null)
  const [roleToAdd, setRoleToAdd] = useState('')

  const heldRoleIds = new Set(userRoles.map((r) => r.roleId))
  const availableRoles = allRoles.filter((r) => !heldRoleIds.has(r.id))
  const roleById = new Map(allRoles.map((r) => [r.id, r]))

  function runAction(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message ?? 'Có lỗi xảy ra.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{email || 'Không có email'}</p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">Trạng thái tài khoản</h2>
        {isSelf ? (
          <p className="text-sm text-muted-foreground">Bạn không thể tự thay đổi trạng thái tài khoản của chính mình.</p>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <MVButton
              size="sm"
              loading={isPending}
              disabled={status === profile.accountStatus}
              onClick={() => runAction(() => updateAccountStatusAction(profile.id, status))}
            >
              Lưu
            </MVButton>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">Vai trò</h2>
        <ul className="space-y-2">
          {userRoles.map((ur) => {
            const role = roleById.get(ur.roleId)
            return (
              <li key={ur.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{role?.name ?? ur.roleId}</span>
                {!isSelf && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(() => revokeRoleAction(profile.id, ur.roleId))}
                    className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                  >
                    Gỡ
                  </button>
                )}
              </li>
            )
          })}
          {userRoles.length === 0 && <p className="text-sm text-muted-foreground">Chưa được gán vai trò nào.</p>}
        </ul>

        {!isSelf && availableRoles.length > 0 && (
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <select
              value={roleToAdd}
              onChange={(e) => setRoleToAdd(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Chọn vai trò để gán...</option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <MVButton
              size="sm"
              loading={isPending}
              disabled={!roleToAdd}
              onClick={() => runAction(() => assignRoleAction(profile.id, roleToAdd))}
            >
              Gán
            </MVButton>
          </div>
        )}
        {isSelf && (
          <p className="mt-3 text-xs text-muted-foreground">Bạn không thể tự gán hoặc gỡ vai trò của chính mình.</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">Quyền truy cập website riêng</h2>
        {websiteAccess.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có quyền truy cập riêng — mặc định truy cập theo toàn bộ tổ chức.
          </p>
        ) : (
          <ul className="space-y-2">
            {websiteAccess.map((wa) => (
              <li key={wa.id} className="rounded-lg bg-secondary/40 px-3 py-2 text-sm text-foreground">
                {wa.websiteId} — {wa.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
