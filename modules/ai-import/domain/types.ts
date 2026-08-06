export type ImportJobStatus =
  | 'UPLOADED'
  | 'PARSING'
  | 'PARSED'
  | 'VALIDATING'
  | 'DRAFT_READY'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'FAILED'

export type ImportJob = {
  id: string
  websiteId: string
  entityType: string
  sourceMediaAssetId: string
  status: ImportJobStatus
  errorMessage: string | null
  publishedPageId: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export type ImportValidationError = { field: string; message: string }

export type ImportDraft = {
  id: string
  jobId: string
  data: Record<string, unknown>
  validationErrors: ImportValidationError[]
  createdAt: string
  updatedAt: string
}
