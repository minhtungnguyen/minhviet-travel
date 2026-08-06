import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { ImportDraft, ImportJob, ImportJobStatus, ImportValidationError } from '@/modules/ai-import/domain/types'
import type { ImportJobCreateInput } from '@/modules/ai-import/schemas/ai-import.schema'

export interface AiImportRepository {
  createJob(input: ImportJobCreateInput, actorId: string): Promise<ImportJob>
  findJobById(id: string): Promise<ImportJob | null>
  listJobsByWebsite(websiteId: string): Promise<ImportJob[]>
  updateJobStatus(id: string, status: ImportJobStatus, errorMessage?: string | null): Promise<ImportJob>
  markJobPublished(id: string, pageId: string): Promise<ImportJob>
  upsertDraft(jobId: string, data: Record<string, unknown>, validationErrors: ImportValidationError[]): Promise<ImportDraft>
  findDraftByJobId(jobId: string): Promise<ImportDraft | null>
}

type JobRow = {
  id: string
  website_id: string
  entity_type: string
  source_media_asset_id: string
  status: string
  error_message: string | null
  published_page_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
const mapJob = (r: JobRow): ImportJob => ({
  id: r.id,
  websiteId: r.website_id,
  entityType: r.entity_type,
  sourceMediaAssetId: r.source_media_asset_id,
  status: r.status as ImportJobStatus,
  errorMessage: r.error_message,
  publishedPageId: r.published_page_id,
  createdBy: r.created_by,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

type DraftRow = {
  id: string
  job_id: string
  data: unknown
  validation_errors: unknown
  created_at: string
  updated_at: string
}
const mapDraft = (r: DraftRow): ImportDraft => ({
  id: r.id,
  jobId: r.job_id,
  data: (r.data ?? {}) as Record<string, unknown>,
  validationErrors: (r.validation_errors ?? []) as ImportValidationError[],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export class SupabaseAiImportRepository implements AiImportRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async createJob(input: ImportJobCreateInput, actorId: string): Promise<ImportJob> {
    const { data, error } = await this.client
      .from('import_jobs')
      .insert({
        website_id: input.websiteId,
        entity_type: input.entityType,
        source_media_asset_id: input.sourceMediaAssetId,
        status: 'UPLOADED',
        created_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ImportJob')
    return mapJob(data)
  }

  async findJobById(id: string): Promise<ImportJob | null> {
    const { data, error } = await this.client.from('import_jobs').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'ImportJob')
    return data ? mapJob(data) : null
  }

  async listJobsByWebsite(websiteId: string): Promise<ImportJob[]> {
    const { data, error } = await this.client
      .from('import_jobs')
      .select('*')
      .eq('website_id', websiteId)
      .order('created_at', { ascending: false })
    if (error) throw mapDatabaseError(error, 'ImportJob')
    return (data ?? []).map(mapJob)
  }

  async updateJobStatus(id: string, status: ImportJobStatus, errorMessage: string | null = null): Promise<ImportJob> {
    const { data, error } = await this.client
      .from('import_jobs')
      .update({ status, error_message: errorMessage })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ImportJob')
    return mapJob(data)
  }

  async markJobPublished(id: string, pageId: string): Promise<ImportJob> {
    const { data, error } = await this.client
      .from('import_jobs')
      .update({ status: 'PUBLISHED', published_page_id: pageId })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ImportJob')
    return mapJob(data)
  }

  /** One draft per job (re-running an import overwrites it) — upsert on the `job_id` unique constraint. */
  async upsertDraft(jobId: string, data: Record<string, unknown>, validationErrors: ImportValidationError[]): Promise<ImportDraft> {
    const { data: row, error } = await this.client
      .from('import_drafts')
      .upsert({ job_id: jobId, data: data as never, validation_errors: validationErrors as never }, { onConflict: 'job_id' })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ImportDraft')
    return mapDraft(row)
  }

  async findDraftByJobId(jobId: string): Promise<ImportDraft | null> {
    const { data, error } = await this.client.from('import_drafts').select('*').eq('job_id', jobId).maybeSingle()
    if (error) throw mapDatabaseError(error, 'ImportDraft')
    return data ? mapDraft(data) : null
  }
}
