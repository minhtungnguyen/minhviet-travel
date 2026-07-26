import { describe, expect, it, vi } from 'vitest'
import type { FormsRepository, NewFormSubmission } from '@/modules/forms/infrastructure/forms.repository'
import type { FormSubmission } from '@/modules/forms/domain/types'
import { FormsService } from '@/modules/forms/application/forms.service'

const BASE_SUBMISSION_INPUT = {
  submissionType: 'individual',
  fullName: 'Nguyen Van A',
  phone: '0900000000',
  consentMarketing: false,
  consentPrivacy: true,
  payload: {},
}

function makeSubmission(overrides: Partial<FormSubmission> = {}): FormSubmission {
  return {
    id: 'sub-1',
    organizationId: 'org-1',
    websiteId: 'site-1',
    formId: 'form-1',
    submissionType: 'individual',
    status: 'NEW',
    fullName: 'Nguyen Van A',
    phone: '0900000000',
    email: null,
    sourceUrl: null,
    sourcePageId: null,
    referrer: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    consentMarketing: false,
    consentPrivacy: true,
    anonymousSessionId: null,
    idempotencyKey: null,
    payload: {},
    submittedAt: '2026-01-01T00:00:00Z',
    processedAt: null,
    ...overrides,
  }
}

function makeFakeRepository(overrides: Partial<FormsRepository> = {}): FormsRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  return {
    listForms: notUsed,
    findFormById: notUsed,
    findFormByKey: notUsed,
    createForm: notUsed,
    updateForm: notUsed,
    deleteForm: notUsed,
    listSubmissions: notUsed,
    findSubmissionById: notUsed,
    updateSubmissionStatus: notUsed,
    findSubmissionByIdempotencyKey: async () => null,
    createSubmission: async (input: NewFormSubmission) => makeSubmission({ payload: input.payload, fullName: input.fullName }),
    ...overrides,
  }
}

const fakeClient = {} as never // submitPublic never calls checkWebsiteAccess, so the client is never touched
const noopAuditLogger = vi.fn(async () => {})

describe('FormsService.submitPublic — honeypot', () => {
  it('a filled honeypot field is reported as success but writes nothing', async () => {
    const createSubmission = vi.fn()
    const repository = makeFakeRepository({ createSubmission })
    const service = new FormsService(repository, fakeClient, noopAuditLogger)

    const result = await service.submitPublic('org-1', 'site-1', 'form-1', { ...BASE_SUBMISSION_INPUT, honeypot: 'i-am-a-bot' }, 'req-1')

    expect(result).toEqual({ submitted: true })
    expect(createSubmission).not.toHaveBeenCalled()
  })

  it('an empty honeypot proceeds to a real submission', async () => {
    const repository = makeFakeRepository()
    const service = new FormsService(repository, fakeClient, noopAuditLogger)
    const result = await service.submitPublic('org-1', 'site-1', 'form-1', BASE_SUBMISSION_INPUT, 'req-1')
    expect(result.submitted).toBe(true)
    expect(result.submissionId).toBeDefined()
  })
})

describe('FormsService.submitPublic — idempotency', () => {
  it('a repeated idempotency key returns the existing submission instead of creating a duplicate', async () => {
    const existing = makeSubmission({ id: 'existing-sub' })
    const createSubmission = vi.fn()
    const repository = makeFakeRepository({
      findSubmissionByIdempotencyKey: async (key) => (key === 'dup-key' ? existing : null),
      createSubmission,
    })
    const service = new FormsService(repository, fakeClient, noopAuditLogger)

    const result = await service.submitPublic(
      'org-1',
      'site-1',
      'form-1',
      { ...BASE_SUBMISSION_INPUT, idempotencyKey: 'dup-key' },
      'req-1',
    )

    expect(result).toEqual({ submitted: true, submissionId: 'existing-sub' })
    expect(createSubmission).not.toHaveBeenCalled()
  })

  it('a fresh idempotency key creates a real submission', async () => {
    const repository = makeFakeRepository()
    const service = new FormsService(repository, fakeClient, noopAuditLogger)
    const result = await service.submitPublic(
      'org-1',
      'site-1',
      'form-1',
      { ...BASE_SUBMISSION_INPUT, idempotencyKey: 'fresh-key' },
      'req-1',
    )
    expect(result.submissionId).toBeDefined()
  })
})

describe('FormsService.submitPublic — organization/website/form ids are never client-controlled', () => {
  it('createSubmission always receives the server-resolved ids, regardless of submission payload contents', async () => {
    const createSubmission = vi.fn(async (input: NewFormSubmission) => makeSubmission({ organizationId: input.organizationId }))
    const repository = makeFakeRepository({ createSubmission })
    const service = new FormsService(repository, fakeClient, noopAuditLogger)

    await service.submitPublic('server-resolved-org', 'server-resolved-site', 'server-resolved-form', BASE_SUBMISSION_INPUT, 'req-1')

    expect(createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'server-resolved-org',
        websiteId: 'server-resolved-site',
        formId: 'server-resolved-form',
      }),
    )
  })

  it('strips angle brackets from free-text fields before persisting', async () => {
    const createSubmission = vi.fn(async (input: NewFormSubmission) => makeSubmission({ fullName: input.fullName }))
    const repository = makeFakeRepository({ createSubmission })
    const service = new FormsService(repository, fakeClient, noopAuditLogger)

    await service.submitPublic('org-1', 'site-1', 'form-1', { ...BASE_SUBMISSION_INPUT, fullName: '<script>alert(1)</script>' }, 'req-1')

    expect(createSubmission).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'scriptalert(1)/script' }))
  })
})
