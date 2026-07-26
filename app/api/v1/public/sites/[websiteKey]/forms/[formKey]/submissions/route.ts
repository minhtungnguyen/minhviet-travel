import type { NextRequest } from 'next/server'
import { withParamsRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getAdminSupabaseClient } from '@/shared/supabase/admin-client'
import { resolveWebsiteByKey } from '@/shared/organization/resolve-website-by-key'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { publicFormSubmissionSchema } from '@/modules/forms/schemas/forms.schema'
import { FormsService } from '@/modules/forms/application/forms.service'
import { SupabaseFormsRepository } from '@/modules/forms/infrastructure/forms.repository'

/**
 * The one route in this sprint that legitimately uses the service-role
 * client for an ordinary (non-audit) write — `form_submissions` has no
 * anon INSERT policy by design (docs/database/rls-policy-matrix.md).
 * Genuinely anonymous: no `resolveActor()` call. Zod validation, the
 * honeypot check and the idempotency lookup all run (in
 * `FormsService#submitPublic`) before this client ever touches the
 * database.
 */
export const POST = withParamsRoute<{ websiteKey: string; formKey: string }>(
  async (req: NextRequest, { websiteKey, formKey }, requestId) => {
    const body = await req.json()
    const parsed = publicFormSubmissionSchema.safeParse(body)
    if (!parsed.success) throw AppError.validation('Invalid form submission payload', { issues: parsed.error.issues })

    const admin = getAdminSupabaseClient()
    const website = await resolveWebsiteByKey(admin, websiteKey)
    if (website.status !== 'ACTIVE') throw AppError.notFound('Website', websiteKey)

    const repository = new SupabaseFormsRepository(admin)
    const form = await repository.findFormByKey(website.id, formKey)
    if (!form || form.status !== 'ACTIVE') throw AppError.notFound('Form', formKey)

    // organization_id is denormalized on form_submissions for reporting
    // (database/migrations/0011_forms.sql) — resolved here via the
    // website's brand, never accepted from the client.
    const organizationId = await resolveWebsiteOrganizationId(admin, website.id)

    const service = new FormsService(repository, admin, recordAuditLog)
    const result = await service.submitPublic(organizationId, website.id, form.id, parsed.data, requestId)
    return ok(result, requestId)
  },
)
