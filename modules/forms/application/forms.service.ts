import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { PaginationQuery } from '@/shared/validation/pagination'
import type { FormsRepository } from '@/modules/forms/infrastructure/forms.repository'
import type { FormSubmissionStatus } from '@/modules/forms/domain/types'
import type { FormCreateInput, FormUpdateInput, PublicFormSubmissionInput } from '@/modules/forms/schemas/forms.schema'

/** Strips angle brackets so free-text fields can never carry a tag into storage — defense in depth alongside React's own output escaping. */
function stripTags(value: string): string {
  return value.replace(/[<>]/g, '')
}

export class FormsService {
  constructor(
    private readonly repository: FormsRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listForms(websiteId: string) {
    return this.repository.listForms(websiteId)
  }

  async createForm(actor: ActorContext, input: FormCreateInput, requestId: string) {
    requirePermission(actor, 'forms.definition.manage')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const existing = await this.repository.findFormByKey(input.websiteId, input.key)
    if (existing) throw AppError.conflict(`Form key "${input.key}" already exists on this website`)
    const form = await this.repository.createForm(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'form.created',
      entityType: 'form',
      entityId: form.id,
      requestId,
    })
    return form
  }

  async updateForm(actor: ActorContext, id: string, input: FormUpdateInput, requestId: string) {
    requirePermission(actor, 'forms.definition.manage')
    const existing = await this.repository.findFormById(id)
    if (!existing) throw AppError.notFound('Form', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const form = await this.repository.updateForm(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'form.updated',
      entityType: 'form',
      entityId: id,
      requestId,
    })
    return form
  }

  async deleteForm(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'forms.definition.manage')
    const existing = await this.repository.findFormById(id)
    if (!existing) throw AppError.notFound('Form', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteForm(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'form.deleted',
      entityType: 'form',
      entityId: id,
      requestId,
    })
  }

  async listSubmissions(actor: ActorContext, websiteId: string, query: PaginationQuery) {
    requirePermission(actor, 'forms.submission.read')
    return this.repository.listSubmissions(websiteId, query)
  }

  async updateSubmissionStatus(actor: ActorContext, id: string, status: FormSubmissionStatus, requestId: string) {
    requirePermission(actor, 'forms.submission.read')
    const existing = await this.repository.findSubmissionById(id)
    if (!existing) throw AppError.notFound('FormSubmission', id)
    const submission = await this.repository.updateSubmissionStatus(id, status)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: existing.organizationId,
      websiteId: existing.websiteId,
      action: 'form_submission.status_updated',
      entityType: 'form_submission',
      entityId: id,
      requestId,
      reason: `status=${status}`,
    })
    return submission
  }

  /**
   * Public submission path. Runs entirely server-side before the
   * service-role write per docs/database/rls-policy-matrix.md ("Why
   * form submissions have no public INSERT policy"): honeypot check,
   * tag stripping, idempotency lookup, then insert with
   * organization/website/form ids all resolved here — never accepted
   * from the client body (spec §16).
   */
  async submitPublic(
    organizationId: string,
    websiteId: string,
    formId: string,
    input: PublicFormSubmissionInput,
    requestId: string,
  ) {
    if (input.honeypot) {
      // A filled honeypot field means a bot — report success without
      // writing a row, so the bot gets no signal it was caught.
      await this.auditLogger({
        actorUserId: null,
        organizationId,
        websiteId,
        action: 'form_submission.honeypot_rejected',
        entityType: 'form_submission',
        requestId,
        source: 'system',
        success: false,
      })
      return { submitted: true }
    }

    if (input.idempotencyKey) {
      const existing = await this.repository.findSubmissionByIdempotencyKey(input.idempotencyKey)
      if (existing) return { submitted: true, submissionId: existing.id }
    }

    const submission = await this.repository.createSubmission({
      organizationId,
      websiteId,
      formId,
      submissionType: input.submissionType,
      fullName: stripTags(input.fullName),
      phone: stripTags(input.phone),
      email: input.email ?? null,
      sourceUrl: input.sourceUrl ?? null,
      sourcePageId: input.sourcePageId ?? null,
      referrer: input.referrer ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      consentMarketing: input.consentMarketing,
      consentPrivacy: input.consentPrivacy,
      anonymousSessionId: input.anonymousSessionId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
      payload: input.payload,
    })

    await this.auditLogger({
      actorUserId: null,
      organizationId,
      websiteId,
      action: 'form_submission.created',
      entityType: 'form_submission',
      entityId: submission.id,
      requestId,
      source: 'api',
    })

    return { submitted: true, submissionId: submission.id }
  }
}
