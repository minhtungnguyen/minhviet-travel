import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { NewsCategory } from '@/modules/news-categories/domain/types'
import type { NewsCategoryCreateInput, NewsCategoryUpdateInput } from '@/modules/news-categories/schemas/news-category.schema'

export interface NewsCategoryRepository {
  listCategories(websiteId: string): Promise<NewsCategory[]>
  findCategoryById(id: string): Promise<NewsCategory | null>
  createCategory(input: NewsCategoryCreateInput): Promise<NewsCategory>
  updateCategory(id: string, input: NewsCategoryUpdateInput): Promise<NewsCategory>
  deleteCategory(id: string): Promise<void>

  /** Assigns (or reassigns) the one category a News article belongs to — upsert on the page_id primary key. */
  assignArticleCategory(pageId: string, categoryId: string): Promise<void>
  findArticleCategoryId(pageId: string): Promise<string | null>
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
const mapCategory = (r: CategoryRow): NewsCategory => ({
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

export class SupabaseNewsCategoryRepository implements NewsCategoryRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listCategories(websiteId: string): Promise<NewsCategory[]> {
    const { data, error } = await this.client
      .from('news_categories')
      .select('*')
      .eq('website_id', websiteId)
      .order('sort_order')
    if (error) throw mapDatabaseError(error, 'NewsCategory')
    return (data ?? []).map(mapCategory)
  }

  async findCategoryById(id: string): Promise<NewsCategory | null> {
    const { data, error } = await this.client.from('news_categories').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'NewsCategory')
    return data ? mapCategory(data) : null
  }

  async createCategory(input: NewsCategoryCreateInput): Promise<NewsCategory> {
    const { data, error } = await this.client
      .from('news_categories')
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
    if (error) throw mapDatabaseError(error, 'NewsCategory')
    return mapCategory(data)
  }

  async updateCategory(id: string, input: NewsCategoryUpdateInput): Promise<NewsCategory> {
    const { data, error } = await this.client
      .from('news_categories')
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
    if (error) throw mapDatabaseError(error, 'NewsCategory')
    return mapCategory(data)
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.client.from('news_categories').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'NewsCategory')
  }

  async assignArticleCategory(pageId: string, categoryId: string): Promise<void> {
    const { error } = await this.client
      .from('news_article_categories')
      .upsert({ page_id: pageId, category_id: categoryId }, { onConflict: 'page_id' })
    if (error) throw mapDatabaseError(error, 'NewsArticleCategory')
  }

  async findArticleCategoryId(pageId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from('news_article_categories')
      .select('category_id')
      .eq('page_id', pageId)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'NewsArticleCategory')
    return data?.category_id ?? null
  }
}
