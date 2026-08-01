'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { NavigationService } from '@/modules/navigation/application/navigation.service'
import { SupabaseNavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'
import { newRequestId } from '@/shared/http/request-id'
import { navigationItemCreateSchema, navigationItemUpdateSchema, navigationMenuCreateSchema } from '@/modules/navigation/schemas/navigation.schema'
import type { NavigationItemCreateInput, NavigationItemUpdateInput, NavigationMenuCreateInput } from '@/modules/navigation/schemas/navigation.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new NavigationService(new SupabaseNavigationRepository(client), client, recordAuditLog)
}

/** Rejects an obviously dead internal path or malformed external URL — "prevent invalid or dead routes where possible" (a cmsPageId target is already validated server-side against real cms_pages rows). */
function assertPlausibleUrl(url: string | undefined) {
  if (!url) return
  if (url.startsWith('/') || /^https?:\/\//.test(url)) return
  throw new Error('Đường dẫn phải bắt đầu bằng "/" (nội bộ) hoặc "http(s)://" (bên ngoài).')
}

async function wrap(fn: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await fn()
    revalidatePath('/admin/navigation')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function createMenuAction(input: NavigationMenuCreateInput): Promise<ActionResult> {
  const parsed = navigationMenuCreateSchema.parse(input)
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.createMenu(actor, parsed, newRequestId()))
}

export async function updateMenuStatusAction(menuId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.updateMenu(actor, menuId, { status }, newRequestId()))
}

export async function createItemAction(menuId: string, input: NavigationItemCreateInput): Promise<ActionResult> {
  const parsed = navigationItemCreateSchema.parse(input)
  assertPlausibleUrl(parsed.url)
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.createItem(actor, menuId, parsed, newRequestId()))
}

export async function updateItemAction(itemId: string, input: NavigationItemUpdateInput): Promise<ActionResult> {
  const parsed = navigationItemUpdateSchema.parse(input)
  assertPlausibleUrl(parsed.url ?? undefined)
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.updateItem(actor, itemId, parsed, newRequestId()))
}

/** Reorders an item by swapping `position` with its neighbor — same pattern as moveSectionAction. */
export async function moveItemAction(itemId: string, newPosition: number): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.updateItem(actor, itemId, { position: newPosition }, newRequestId()))
}

export async function deleteItemAction(itemId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.deleteItem(actor, itemId, newRequestId()))
}
