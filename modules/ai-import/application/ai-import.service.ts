import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { AiImportRepository } from '@/modules/ai-import/infrastructure/ai-import.repository'
import type { ImportJobCreateInput } from '@/modules/ai-import/schemas/ai-import.schema'
import type { AiImportProvider } from '@/integrations/ai/contracts/ai-import-provider'
import type { CmsService } from '@/modules/cms/application/cms.service'
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'
import { slugifyVietnamese } from '@/lib/cms/slugify'

const RUNNABLE_STATUSES = new Set(['UPLOADED', 'FAILED'])
const APPROVABLE_STATUSES = new Set(['DRAFT_READY', 'IN_REVIEW'])

/**
 * Orchestrates the AI Import pipeline (integrations/ai/contracts/
 * ai-import-provider.ts): create job -> run (parse+normalize, tracking
 * status through PARSING/PARSED/VALIDATING/DRAFT_READY, or FAILED on
 * error) -> human review of the persisted draft -> approve, which hands
 * off to `CmsService` to create a real Tour Core DRAFT page pre-filled
 * with the extracted content — the same primitives
 * app/admin/tours/actions.ts's `createTourAction` uses, just with real
 * data instead of empty sections. Departures/categories/destinations are
 * deliberately left for the admin to add afterward on the normal Tour
 * editor — those are structured/transactional data no document parser
 * should guess at.
 */
export class AiImportService {
  constructor(
    private readonly repository: AiImportRepository,
    private readonly provider: AiImportProvider,
    private readonly cms: CmsService,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listJobs(actor: ActorContext, websiteId: string) {
    requirePermission(actor, 'cms.page.create')
    await this.checkWebsiteAccess(actor, websiteId)
    return this.repository.listJobsByWebsite(websiteId)
  }

  async getJobWithDraft(actor: ActorContext, jobId: string) {
    requirePermission(actor, 'cms.page.create')
    const job = await this.repository.findJobById(jobId)
    if (!job) throw AppError.notFound('ImportJob', jobId)
    await this.checkWebsiteAccess(actor, job.websiteId)
    const draft = await this.repository.findDraftByJobId(jobId)
    return { job, draft }
  }

  async createJob(actor: ActorContext, input: ImportJobCreateInput, requestId: string) {
    requirePermission(actor, 'cms.page.create')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const job = await this.repository.createJob(input, actor.userId)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'ai_import_job.created',
      entityType: 'import_job',
      entityId: job.id,
      requestId,
    })
    return job
  }

  /** Signed URL for the job's source file — PRIVATE media asset, same pattern app/admin/media/page.tsx already uses. */
  private async resolveSourceFileUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.client.storage.from('media-private').createSignedUrl(storagePath, 3600)
    if (error || !data?.signedUrl) throw new AppError('INTERNAL_ERROR', 'Không thể tạo đường dẫn tải tệp nguồn.')
    return data.signedUrl
  }

  async runJob(actor: ActorContext, jobId: string, requestId: string) {
    requirePermission(actor, 'cms.page.create')
    const job = await this.repository.findJobById(jobId)
    if (!job) throw AppError.notFound('ImportJob', jobId)
    await this.checkWebsiteAccess(actor, job.websiteId)
    if (!RUNNABLE_STATUSES.has(job.status)) {
      throw AppError.validation(`Không thể chạy lại — trạng thái hiện tại là ${job.status}.`)
    }

    try {
      const { data: asset, error: assetError } = await this.client
        .from('media_assets')
        .select('storage_path, mime_type')
        .eq('id', job.sourceMediaAssetId)
        .maybeSingle()
      if (assetError || !asset) throw AppError.notFound('MediaAsset', job.sourceMediaAssetId)

      await this.repository.updateJobStatus(jobId, 'PARSING')
      const sourceUrl = await this.resolveSourceFileUrl(asset.storage_path)
      const { rawContent } = await this.provider.parse(sourceUrl, asset.mime_type)

      await this.repository.updateJobStatus(jobId, 'VALIDATING')
      const normalized = await this.provider.normalize(rawContent, job.entityType)
      await this.repository.upsertDraft(jobId, normalized.data, normalized.validationErrors)

      const updated = await this.repository.updateJobStatus(jobId, 'DRAFT_READY')
      await this.auditLogger({
        actorUserId: actor.userId,
        organizationId: actor.organizationId,
        websiteId: job.websiteId,
        action: 'ai_import_job.parsed',
        entityType: 'import_job',
        entityId: jobId,
        requestId,
      })
      return updated
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý AI Import.'
      await this.repository.updateJobStatus(jobId, 'FAILED', message)
      throw error
    }
  }

  /** Appends `-2`, `-3`, ... until the slug is free on this website/locale — same idea as News/Pages' live slug check, just resolved server-side once instead of interactively. */
  private async uniqueTourSlugSuffix(websiteId: string, locale: string, baseSuffix: string): Promise<string> {
    const base = baseSuffix || `tour-${Date.now()}`
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
      const { data } = await this.client
        .from('cms_pages')
        .select('id')
        .eq('website_id', websiteId)
        .eq('locale', locale)
        .eq('slug', `${TOUR_SLUG_PREFIX}${candidate}`)
        .is('deleted_at', null)
        .maybeSingle()
      if (!data) return candidate
    }
    throw new AppError('INTERNAL_ERROR', 'Không thể tạo slug duy nhất cho tour.')
  }

  /**
   * Creates a real Tour Core DRAFT page from the reviewed draft — same
   * four sections `createTourAction` creates (content/itinerary/policy/
   * gallery), pre-filled from `draft.data` instead of empty. The admin
   * then finishes the tour on the normal editor (categories,
   * destinations, departures/pricing, gallery images), same as any
   * manually-created Tour.
   */
  async approveDraft(actor: ActorContext, jobId: string, websiteId: string, locale: 'vi' | 'en' | 'zh' | 'ko' | 'ja', requestId: string) {
    requirePermission(actor, 'cms.page.create')
    const job = await this.repository.findJobById(jobId)
    if (!job) throw AppError.notFound('ImportJob', jobId)
    await this.checkWebsiteAccess(actor, job.websiteId)
    if (!APPROVABLE_STATUSES.has(job.status)) {
      throw AppError.validation(`Draft chưa sẵn sàng để duyệt — trạng thái hiện tại là ${job.status}.`)
    }
    const draft = await this.repository.findDraftByJobId(jobId)
    if (!draft) throw AppError.notFound('ImportDraft', jobId)

    const data = draft.data as {
      title?: string
      country?: string
      departureCity?: string
      body?: string
      itinerary?: { day: number; title: string; description: string }[]
      inclusions?: string[]
      exclusions?: string[]
      cancellationNote?: string
    }
    const title = data.title || 'Tour chưa đặt tên (từ AI Import)'
    const slugSuffix = await this.uniqueTourSlugSuffix(websiteId, locale, slugifyVietnamese(title))

    const { page } = await this.cms.createPageWithDraftVersion(
      actor,
      { websiteId, locale, pageType: 'TOUR', slug: `${TOUR_SLUG_PREFIX}${slugSuffix}` },
      title,
      requestId,
    )
    const contentSection = await this.cms.createSection(actor, page.id, 'content', 0, requestId)
    await this.cms.createBlock(
      actor,
      contentSection.id,
      'RICH_TEXT',
      0,
      { body: data.body ?? '', country: data.country ?? '', departureCity: data.departureCity ?? '' },
      requestId,
    )
    const itinerarySection = await this.cms.createSection(actor, page.id, 'itinerary', 1, requestId)
    await this.cms.createBlock(actor, itinerarySection.id, 'TIMELINE', 0, { days: data.itinerary ?? [] }, requestId)
    const policySection = await this.cms.createSection(actor, page.id, 'policy', 2, requestId)
    await this.cms.createBlock(
      actor,
      policySection.id,
      'CUSTOM',
      0,
      { inclusions: data.inclusions ?? [], exclusions: data.exclusions ?? [], cancellationNote: data.cancellationNote ?? '' },
      requestId,
    )
    const gallerySection = await this.cms.createSection(actor, page.id, 'gallery', 3, requestId)
    await this.cms.createBlock(actor, gallerySection.id, 'GALLERY', 0, { images: [] }, requestId)

    const updatedJob = await this.repository.markJobPublished(jobId, page.id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: job.websiteId,
      action: 'ai_import_job.approved',
      entityType: 'import_job',
      entityId: jobId,
      requestId,
    })
    return { job: updatedJob, pageId: page.id }
  }

  async rejectJob(actor: ActorContext, jobId: string, requestId: string) {
    requirePermission(actor, 'cms.page.create')
    const job = await this.repository.findJobById(jobId)
    if (!job) throw AppError.notFound('ImportJob', jobId)
    await this.checkWebsiteAccess(actor, job.websiteId)
    const updated = await this.repository.updateJobStatus(jobId, 'FAILED', 'Đã từ chối bởi người kiểm duyệt.')
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: job.websiteId,
      action: 'ai_import_job.rejected',
      entityType: 'import_job',
      entityId: jobId,
      requestId,
    })
    return updated
  }
}
