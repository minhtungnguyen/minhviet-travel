import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { TourCategory } from '@/modules/tour-categories/domain/types'
import type { TourCategoryCreateInput, TourCategoryUpdateInput } from '@/modules/tour-categories/schemas/tour-category.schema'

export interface TourCategoryRepository {
  listCategories(websiteId: string): Promise<TourCategory[]>
  findCategoryById(id: string): Promise<TourCategory | null>
  createCategory(input: TourCategoryCreateInput): Promise<TourCategory>
  updateCategory(id: string, input: TourCategoryUpdateInput): Promise<TourCategory>
  deleteCategory(id: string): Promise<void>

  /** Many-to-many (unlike News' one-category rule) — full replace of a tour's category set. */
  replaceTourCategories(pageId: string, categoryIds: string[]): Promise<void>
  listTourCategoryIds(pageId: string): Promise<string[]>
}

type CategoryRow = {
  id: string
  website_id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
const mapCategory = (r: CategoryRow): TourCategory => ({
  id: r.id,
  websiteId: r.website_id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  icon: r.icon,
  color: r.color,
  sortOrder: r.sort_order,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export class SupabaseTourCategoryRepository implements TourCategoryRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listCategories(websiteId: string): Promise<TourCategory[]> {
    const { data, error } = await this.client
      .from('tour_categories')
      .select('*')
      .eq('website_id', websiteId)
      .order('sort_order')
    if (error) throw mapDatabaseError(error, 'TourCategory')
    return (data ?? []).map(mapCategory)
  }

  async findCategoryById(id: string): Promise<TourCategory | null> {
    const { data, error } = await this.client.from('tour_categories').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'TourCategory')
    return data ? mapCategory(data) : null
  }

  async createCategory(input: TourCategoryCreateInput): Promise<TourCategory> {
    const { data, error } = await this.client
      .from('tour_categories')
      .insert({
        website_id: input.websiteId,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        icon: input.icon ?? null,
        color: input.color ?? null,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'TourCategory')
    return mapCategory(data)
  }

  async updateCategory(id: string, input: TourCategoryUpdateInput): Promise<TourCategory> {
    const { data, error } = await this.client
      .from('tour_categories')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'TourCategory')
    return mapCategory(data)
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.client.from('tour_categories').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'TourCategory')
  }

  /** Delete-then-insert — a single admin editing one tour's categories at a time, no concurrent-write contention to guard against. */
  async replaceTourCategories(pageId: string, categoryIds: string[]): Promise<void> {
    const { error: deleteError } = await this.client.from('tour_page_categories').delete().eq('page_id', pageId)
    if (deleteError) throw mapDatabaseError(deleteError, 'TourPageCategory')
    if (categoryIds.length === 0) return
    const { error: insertError } = await this.client
      .from('tour_page_categories')
      .insert(categoryIds.map((categoryId) => ({ page_id: pageId, category_id: categoryId })))
    if (insertError) throw mapDatabaseError(insertError, 'TourPageCategory')
  }

  async listTourCategoryIds(pageId: string): Promise<string[]> {
    const { data, error } = await this.client.from('tour_page_categories').select('category_id').eq('page_id', pageId)
    if (error) throw mapDatabaseError(error, 'TourPageCategory')
    return (data ?? []).map((r) => r.category_id)
  }
}
