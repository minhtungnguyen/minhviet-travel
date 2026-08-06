import { Badge } from '@/components/ui/badge'
import type { ImportJobStatus } from '@/modules/ai-import/domain/types'

const STATUS_COPY: Record<ImportJobStatus, { label: string; variant: 'neutral' | 'info' | 'warning' | 'success' | 'destructive' }> = {
  UPLOADED: { label: 'Đã tải lên', variant: 'neutral' },
  PARSING: { label: 'Đang phân tích...', variant: 'info' },
  PARSED: { label: 'Đã phân tích', variant: 'info' },
  VALIDATING: { label: 'Đang chuẩn hoá...', variant: 'info' },
  DRAFT_READY: { label: 'Sẵn sàng kiểm duyệt', variant: 'warning' },
  IN_REVIEW: { label: 'Đang kiểm duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  PUBLISHED: { label: 'Đã tạo tour', variant: 'success' },
  FAILED: { label: 'Thất bại', variant: 'destructive' },
}

export function ImportJobStatusBadge({ status }: { status: ImportJobStatus }) {
  const copy = STATUS_COPY[status]
  return <Badge variant={copy.variant}>{copy.label}</Badge>
}
