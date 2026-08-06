import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AiImportService } from '@/modules/ai-import/application/ai-import.service'
import { SupabaseAiImportRepository } from '@/modules/ai-import/infrastructure/ai-import.repository'
import { AnthropicTourImportProvider } from '@/integrations/ai/providers/anthropic-tour-import-provider'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { TourImportReview } from '@/components/admin/tour-import-review'

export const metadata: Metadata = { title: 'Kiểm duyệt bản nháp AI Import | Minh Việt Travel Admin' }

export default async function TourImportJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.create')) {
    return <AdminUnauthorized />
  }

  const client = await getServerSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const service = new AiImportService(new SupabaseAiImportRepository(client), new AnthropicTourImportProvider(), cms, client, recordAuditLog)

  const { job, draft } = await service.getJobWithDraft(actor, id).catch(() => ({ job: null, draft: null }))
  if (!job) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Kiểm duyệt bản nháp AI Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">Xem lại nội dung AI trích xuất trước khi tạo tour thật.</p>
      </div>
      <TourImportReview job={job} draft={draft} websiteId={job.websiteId} />
    </div>
  )
}
