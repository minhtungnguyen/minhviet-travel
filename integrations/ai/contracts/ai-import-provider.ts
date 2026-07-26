/**
 * Extension point for the future AI Import Engine (master-prompt §4.2,
 * explicitly out of scope for Sprint 1: "Sprint 1 must not build the
 * complete AI Import Engine"). This records the intended pipeline shape
 * only, so a later sprint's `import_jobs`/`import_drafts` schema has a
 * TypeScript contract to target from day one.
 *
 * Pipeline: source uploaded -> ImportJob created -> parsing -> normalization
 * -> validation -> draft generated -> human review -> approval -> entity published.
 */
export type ImportJobStatus =
  | 'UPLOADED' | 'PARSING' | 'PARSED' | 'VALIDATING' | 'DRAFT_READY'
  | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'FAILED'

export type ImportDraft = {
  jobId: string
  entityType: string // e.g. 'tour', 'hotel' — whatever domain owns the target table
  data: Record<string, unknown>
  validationErrors: Array<{ field: string; message: string }>
}

export interface AiImportProvider {
  /** Extracts raw structured content from a source file (PDF/Word/Excel/image). */
  parse(sourceFileUrl: string, mimeType: string): Promise<{ rawContent: Record<string, unknown> }>
  /** Maps raw content to a draft entity of the given type, flagging validation issues. */
  normalize(rawContent: Record<string, unknown>, entityType: string): Promise<ImportDraft>
}
