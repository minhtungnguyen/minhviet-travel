'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { TourCategoryService } from '@/modules/tour-categories/application/tour-category.service'
import { SupabaseTourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { TourCategoryCreateInput, TourCategoryUpdateInput } from '@/modules/tour-categories/schemas/tour-category.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new TourCategoryService(new SupabaseTourCategoryRepository(client), client, recordAuditLog)
}

export async function createTourCategoryAction(input: TourCategoryCreateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.createCategory(actor, input, newRequestId())
    revalidatePath('/admin/tours/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function updateTourCategoryAction(id: string, input: TourCategoryUpdateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.updateCategory(actor, id, input, newRequestId())
    revalidatePath('/admin/tours/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function deleteTourCategoryAction(id: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.deleteCategory(actor, id, newRequestId())
    revalidatePath('/admin/tours/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra. Danh mục có thể đang được tour sử dụng.' }
  }
}
