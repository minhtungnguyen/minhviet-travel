'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { NewsCategoryCreateInput, NewsCategoryUpdateInput } from '@/modules/news-categories/schemas/news-category.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new NewsCategoryService(new SupabaseNewsCategoryRepository(client), client, recordAuditLog)
}

export async function createCategoryAction(input: NewsCategoryCreateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.createCategory(actor, input, newRequestId())
    revalidatePath('/admin/news/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function updateCategoryAction(id: string, input: NewsCategoryUpdateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.updateCategory(actor, id, input, newRequestId())
    revalidatePath('/admin/news/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.deleteCategory(actor, id, newRequestId())
    revalidatePath('/admin/news/categories')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra. Danh mục có thể đang được bài viết sử dụng.' }
  }
}

export async function assignArticleCategoryAction(pageId: string, categoryId: string, websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.assignArticleCategory(actor, pageId, categoryId, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${pageId}`)
    revalidatePath('/tin-tuc')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}
