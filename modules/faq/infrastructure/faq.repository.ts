import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { Faq, FaqCategory } from '@/modules/faq/domain/types'
import type {
  FaqCategoryCreateInput,
  FaqCategoryUpdateInput,
  FaqCreateInput,
  FaqUpdateInput,
} from '@/modules/faq/schemas/faq.schema'

export interface FaqRepository {
  listCategories(websiteId: string): Promise<FaqCategory[]>
  findCategoryById(id: string): Promise<FaqCategory | null>
  createCategory(input: FaqCategoryCreateInput): Promise<FaqCategory>
  updateCategory(id: string, input: FaqCategoryUpdateInput): Promise<FaqCategory>
  deleteCategory(id: string): Promise<void>

  listFaqs(faqCategoryId: string): Promise<Faq[]>
  findFaqById(id: string): Promise<Faq | null>
  createFaq(input: FaqCreateInput): Promise<Faq>
  updateFaq(id: string, input: FaqUpdateInput): Promise<Faq>
  deleteFaq(id: string): Promise<void>
}

type CategoryRow = { id: string; website_id: string; name: string; slug: string; position: number; status: string }
const mapCategory = (r: CategoryRow): FaqCategory => ({
  id: r.id,
  websiteId: r.website_id,
  name: r.name,
  slug: r.slug,
  position: r.position,
  status: r.status as FaqCategory['status'],
})

type FaqRow = {
  id: string
  faq_category_id: string
  website_id: string
  locale: string
  question: string
  answer: string
  position: number
  status: string
}
const mapFaq = (r: FaqRow): Faq => ({
  id: r.id,
  faqCategoryId: r.faq_category_id,
  websiteId: r.website_id,
  locale: r.locale,
  question: r.question,
  answer: r.answer,
  position: r.position,
  status: r.status as Faq['status'],
})

export class SupabaseFaqRepository implements FaqRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listCategories(websiteId: string): Promise<FaqCategory[]> {
    const { data, error } = await this.client.from('faq_categories').select('*').eq('website_id', websiteId).order('position')
    if (error) throw mapDatabaseError(error, 'FaqCategory')
    return (data ?? []).map(mapCategory)
  }

  async findCategoryById(id: string): Promise<FaqCategory | null> {
    const { data, error } = await this.client.from('faq_categories').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'FaqCategory')
    return data ? mapCategory(data) : null
  }

  async createCategory(input: FaqCategoryCreateInput): Promise<FaqCategory> {
    const { data, error } = await this.client
      .from('faq_categories')
      .insert({ website_id: input.websiteId, name: input.name, slug: input.slug, position: input.position })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'FaqCategory')
    return mapCategory(data)
  }

  async updateCategory(id: string, input: FaqCategoryUpdateInput): Promise<FaqCategory> {
    const { data, error } = await this.client
      .from('faq_categories')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.position !== undefined && { position: input.position }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'FaqCategory')
    return mapCategory(data)
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.client.from('faq_categories').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'FaqCategory')
  }

  async listFaqs(faqCategoryId: string): Promise<Faq[]> {
    const { data, error } = await this.client.from('faqs').select('*').eq('faq_category_id', faqCategoryId).order('position')
    if (error) throw mapDatabaseError(error, 'Faq')
    return (data ?? []).map(mapFaq)
  }

  async findFaqById(id: string): Promise<Faq | null> {
    const { data, error } = await this.client.from('faqs').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Faq')
    return data ? mapFaq(data) : null
  }

  async createFaq(input: FaqCreateInput): Promise<Faq> {
    const { data, error } = await this.client
      .from('faqs')
      .insert({
        faq_category_id: input.faqCategoryId,
        website_id: input.websiteId,
        locale: input.locale,
        question: input.question,
        answer: input.answer,
        position: input.position,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Faq')
    return mapFaq(data)
  }

  async updateFaq(id: string, input: FaqUpdateInput): Promise<Faq> {
    const { data, error } = await this.client
      .from('faqs')
      .update({
        ...(input.locale !== undefined && { locale: input.locale }),
        ...(input.question !== undefined && { question: input.question }),
        ...(input.answer !== undefined && { answer: input.answer }),
        ...(input.position !== undefined && { position: input.position }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Faq')
    return mapFaq(data)
  }

  async deleteFaq(id: string): Promise<void> {
    const { error } = await this.client.from('faqs').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'Faq')
  }
}
