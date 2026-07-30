'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { AccountStatus } from '@/modules/access-control/domain/types'

async function getService() {
  return new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
}

export type ActionResult = { ok: true } | { ok: false; message: string }

export async function updateAccountStatusAction(userProfileId: string, accountStatus: AccountStatus): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.updateUser(actor, userProfileId, { accountStatus }, newRequestId())
    revalidatePath(`/admin/users/${userProfileId}`)
    revalidatePath('/admin/users')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function assignRoleAction(userProfileId: string, roleId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.assignRole(actor, { userProfileId, roleId, scopes: [] }, newRequestId())
    revalidatePath(`/admin/users/${userProfileId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function revokeRoleAction(userProfileId: string, roleId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.revokeRole(actor, { userProfileId, roleId }, newRequestId())
    revalidatePath(`/admin/users/${userProfileId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function grantWebsiteAccessAction(userProfileId: string, websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.grantWebsiteAccess(actor, { userProfileId, websiteId }, newRequestId())
    revalidatePath(`/admin/users/${userProfileId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function revokeWebsiteAccessAction(userProfileId: string, websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.revokeWebsiteAccess(actor, { userProfileId, websiteId }, newRequestId())
    revalidatePath(`/admin/users/${userProfileId}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}
