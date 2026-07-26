import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type { Form, FormSubmission, FormSubmissionStatus } from '@/modules/forms/domain/types'
import type { FormCreateInput, FormUpdateInput } from '@/modules/forms/schemas/forms.schema'

export type NewFormSubmission = {
  organizationId: string
  websiteId: string
  formId: string
  submissionType: string
  fullName: string
  phone: string
  email: string | null
  sourceUrl: string | null
  sourcePageId: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  consentMarketing: boolean
  consentPrivacy: boolean
  anonymousSessionId: string | null
  idempotencyKey: string | null
  payload: Record<string, unknown>
}

export interface FormsRepository {
  listForms(websiteId: string): Promise<Form[]>
  findFormById(id: string): Promise<Form | null>
  findFormByKey(websiteId: string, key: string): Promise<Form | null>
  createForm(input: FormCreateInput): Promise<Form>
  updateForm(id: string, input: FormUpdateInput): Promise<Form>
  deleteForm(id: string): Promise<void>

  listSubmissions(websiteId: string, query: PaginationQuery): Promise<PaginatedResult<FormSubmission>>
  findSubmissionById(id: string): Promise<FormSubmission | null>
  updateSubmissionStatus(id: string, status: FormSubmissionStatus): Promise<FormSubmission>

  /** Public write path — service-role client only, see modules/forms/application. */
  findSubmissionByIdempotencyKey(idempotencyKey: string): Promise<FormSubmission | null>
  createSubmission(input: NewFormSubmission): Promise<FormSubmission>
}

type FormRow = { id: string; website_id: string; key: string; name: string; status: string }
const mapForm = (r: FormRow): Form => ({ id: r.id, websiteId: r.website_id, key: r.key, name: r.name, status: r.status as Form['status'] })

type SubmissionRow = {
  id: string
  organization_id: string
  website_id: string
  form_id: string
  submission_type: string
  status: string
  full_name: string
  phone: string
  email: string | null
  source_url: string | null
  source_page_id: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  consent_marketing: boolean
  consent_privacy: boolean
  anonymous_session_id: string | null
  idempotency_key: string | null
  payload: unknown
  submitted_at: string
  processed_at: string | null
}
const mapSubmission = (r: SubmissionRow): FormSubmission => ({
  id: r.id,
  organizationId: r.organization_id,
  websiteId: r.website_id,
  formId: r.form_id,
  submissionType: r.submission_type,
  status: r.status as FormSubmission['status'],
  fullName: r.full_name,
  phone: r.phone,
  email: r.email,
  sourceUrl: r.source_url,
  sourcePageId: r.source_page_id,
  referrer: r.referrer,
  utmSource: r.utm_source,
  utmMedium: r.utm_medium,
  utmCampaign: r.utm_campaign,
  utmContent: r.utm_content,
  utmTerm: r.utm_term,
  consentMarketing: r.consent_marketing,
  consentPrivacy: r.consent_privacy,
  anonymousSessionId: r.anonymous_session_id,
  idempotencyKey: r.idempotency_key,
  payload: (r.payload ?? {}) as Record<string, unknown>,
  submittedAt: r.submitted_at,
  processedAt: r.processed_at,
})

export class SupabaseFormsRepository implements FormsRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listForms(websiteId: string): Promise<Form[]> {
    const { data, error } = await this.client.from('forms').select('*').eq('website_id', websiteId)
    if (error) throw mapDatabaseError(error, 'Form')
    return (data ?? []).map(mapForm)
  }

  async findFormById(id: string): Promise<Form | null> {
    const { data, error } = await this.client.from('forms').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Form')
    return data ? mapForm(data) : null
  }

  async findFormByKey(websiteId: string, key: string): Promise<Form | null> {
    const { data, error } = await this.client.from('forms').select('*').eq('website_id', websiteId).ilike('key', key).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Form')
    return data ? mapForm(data) : null
  }

  async createForm(input: FormCreateInput): Promise<Form> {
    const { data, error } = await this.client
      .from('forms')
      .insert({ website_id: input.websiteId, key: input.key, name: input.name })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Form')
    return mapForm(data)
  }

  async updateForm(id: string, input: FormUpdateInput): Promise<Form> {
    const { data, error } = await this.client
      .from('forms')
      .update({ ...(input.name !== undefined && { name: input.name }), ...(input.status !== undefined && { status: input.status }) })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Form')
    return mapForm(data)
  }

  async deleteForm(id: string): Promise<void> {
    const { error } = await this.client.from('forms').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'Form')
  }

  async listSubmissions(websiteId: string, query: PaginationQuery): Promise<PaginatedResult<FormSubmission>> {
    const from = (query.page - 1) * query.pageSize
    const builder = this.client
      .from('form_submissions')
      .select('*', { count: 'exact' })
      .eq('website_id', websiteId)
      .order('submitted_at', { ascending: false })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'FormSubmission')
    return { items: (data ?? []).map(mapSubmission), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async findSubmissionById(id: string): Promise<FormSubmission | null> {
    const { data, error } = await this.client.from('form_submissions').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'FormSubmission')
    return data ? mapSubmission(data) : null
  }

  async updateSubmissionStatus(id: string, status: FormSubmissionStatus): Promise<FormSubmission> {
    const { data, error } = await this.client
      .from('form_submissions')
      .update({ status, ...(status === 'PROCESSED' && { processed_at: new Date().toISOString() }) })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'FormSubmission')
    return mapSubmission(data)
  }

  async findSubmissionByIdempotencyKey(idempotencyKey: string): Promise<FormSubmission | null> {
    const { data, error } = await this.client.from('form_submissions').select('*').eq('idempotency_key', idempotencyKey).maybeSingle()
    if (error) throw mapDatabaseError(error, 'FormSubmission')
    return data ? mapSubmission(data) : null
  }

  async createSubmission(input: NewFormSubmission): Promise<FormSubmission> {
    const { data, error } = await this.client
      .from('form_submissions')
      .insert({
        organization_id: input.organizationId,
        website_id: input.websiteId,
        form_id: input.formId,
        submission_type: input.submissionType,
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
        source_url: input.sourceUrl,
        source_page_id: input.sourcePageId,
        referrer: input.referrer,
        utm_source: input.utmSource,
        utm_medium: input.utmMedium,
        utm_campaign: input.utmCampaign,
        utm_content: input.utmContent,
        utm_term: input.utmTerm,
        consent_marketing: input.consentMarketing,
        consent_privacy: input.consentPrivacy,
        anonymous_session_id: input.anonymousSessionId,
        idempotency_key: input.idempotencyKey,
        payload: input.payload as never,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'FormSubmission')
    return mapSubmission(data)
  }
}
