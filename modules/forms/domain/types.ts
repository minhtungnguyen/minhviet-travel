export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type FormSubmissionStatus = 'NEW' | 'VALIDATED' | 'PROCESSED' | 'REJECTED' | 'SPAM'

export type Form = {
  id: string
  websiteId: string
  key: string
  name: string
  status: EntityStatus
}

export type FormSubmission = {
  id: string
  organizationId: string
  websiteId: string
  formId: string
  submissionType: string
  status: FormSubmissionStatus
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
  submittedAt: string
  processedAt: string | null
}
