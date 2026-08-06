import Link from 'next/link'
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
import { TourImportUploadForm } from '@/components/admin/tour-import-upload-form'
import { ImportJobStatusBadge } from '@/components/admin/import-job-status-badge'
import type { ImportJobStatus } from '@/modules/ai-import/domain/types'

export const metadata: Metadata = { title: 'Nhập Tour từ Word (AI) | Minh Việt Travel Admin' }

const RUNNABLE: ImportJobStatus[] = ['UPLOADED', 'FAILED']

export default async function TourImportPage() {
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.create')) {
    return <AdminUnauthorized />
  }

  const client = await getServerSupabaseClient()
  const { data: websites } = await client.from('websites').select('id, name, domain').is('deleted_at', null).order('created_at')
  const websiteId = websites?.[0]?.id
  if (!websiteId) {
    return <p className="text-sm text-muted-foreground">Chưa có website nào được cấu hình.</p>
  }

  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const service = new AiImportService(new SupabaseAiImportRepository(client), new AnthropicTourImportProvider(), cms, client, recordAuditLog)
  const jobs = await service.listJobs(actor, websiteId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Nhập Tour từ Word (AI)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tải lên tài liệu chương trình tour (.docx) — AI trích xuất nội dung thành bản nháp, bạn kiểm duyệt trước khi tạo tour thật.
        </p>
      </div>

      <TourImportUploadForm websiteId={websiteId} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Tạo lúc</th>
              <th className="px-4 py-3">Lỗi</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-4 py-3">
                  <ImportJobStatusBadge status={job.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(job.createdAt).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 max-w-xs truncate text-destructive" title={job.errorMessage ?? undefined}>
                  {job.errorMessage ?? '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/tours/import/${job.id}`} className="font-medium text-primary hover:underline">
                    {RUNNABLE.includes(job.status) ? 'Xem / Chạy lại' : 'Xem'}
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có lượt nhập nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
