import { describe, expect, it } from 'vitest'
import { ok, fail } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'

describe('response envelope', () => {
  it('ok() returns the fixed success shape', async () => {
    const response = ok({ id: '1' }, 'req-1', { total: 1 })
    const body = await response.json()
    expect(body).toEqual({ success: true, data: { id: '1' }, meta: { total: 1 }, requestId: 'req-1' })
  })

  it('fail() maps each AppErrorCode to the documented HTTP status', async () => {
    const cases: [AppError, number][] = [
      [AppError.validation('x'), 400],
      [AppError.unauthenticated(), 401],
      [AppError.accountDisabled(), 401],
      [AppError.forbidden(), 403],
      [AppError.membershipRequired(), 403],
      [AppError.websiteAccessDenied(), 403],
      [AppError.notFound('Thing', '1'), 404],
      [AppError.conflict('dup'), 409],
    ]
    for (const [error, status] of cases) {
      const response = fail(error, 'req-1')
      expect(response.status).toBe(status)
    }
  })

  it('fail() never forwards `details` for INTERNAL_ERROR, even if the AppError carries some', async () => {
    const error = new AppError('INTERNAL_ERROR', 'boom', { postgresCode: '42P01' })
    const response = fail(error, 'req-1')
    const body = await response.json()
    expect(body.error.details).toBeUndefined()
  })

  it('fail() forwards `details` for a normal 4xx error', async () => {
    const error = AppError.validation('bad payload', { issues: ['x'] })
    const response = fail(error, 'req-1')
    const body = await response.json()
    expect(body.error.details).toEqual({ issues: ['x'] })
  })
})
