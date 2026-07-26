import { describe, expect, it } from 'vitest'
import { AppError } from '@/shared/errors/app-error'

describe('AppError factories', () => {
  it('maps each factory to its documented code', () => {
    expect(AppError.validation('bad input').code).toBe('VALIDATION_ERROR')
    expect(AppError.notFound('Organization', 'id-1').code).toBe('NOT_FOUND')
    expect(AppError.unauthenticated().code).toBe('UNAUTHENTICATED')
    expect(AppError.accountDisabled().code).toBe('ACCOUNT_DISABLED')
    expect(AppError.membershipRequired().code).toBe('MEMBERSHIP_REQUIRED')
    expect(AppError.forbidden().code).toBe('FORBIDDEN')
    expect(AppError.websiteAccessDenied().code).toBe('WEBSITE_ACCESS_DENIED')
    expect(AppError.conflict('dup').code).toBe('CONFLICT')
  })

  it('notFound() includes the entity and id in the message without leaking internals', () => {
    const error = AppError.notFound('Organization', 'abc-123')
    expect(error.message).toContain('Organization')
    expect(error.message).toContain('abc-123')
  })

  it('is a real Error instance so it survives normal throw/catch', () => {
    expect(() => {
      throw AppError.forbidden('nope')
    }).toThrow(AppError)
  })
})
