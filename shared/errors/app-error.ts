/**
 * Canonical error codes for MV Travel OS. Every service/repository throws
 * `AppError`, never a raw `Error` — route handlers map `AppError.code` to
 * an HTTP status via `shared/http/error-map.ts` and never leak internals
 * (stack traces, raw Postgres errors) to the client. See
 * docs/api/error-codes.md for the full list and HTTP mapping.
 */
export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHENTICATED'
  | 'ACCOUNT_DISABLED'
  | 'MEMBERSHIP_REQUIRED'
  | 'FORBIDDEN'
  | 'WEBSITE_ACCESS_DENIED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly details?: Record<string, unknown>

  constructor(code: AppErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }

  static validation(message: string, details?: Record<string, unknown>) {
    return new AppError('VALIDATION_ERROR', message, details)
  }

  static notFound(entity: string, id: string) {
    return new AppError('NOT_FOUND', `${entity} ${id} not found`)
  }

  static unauthenticated(message = 'Authentication required') {
    return new AppError('UNAUTHENTICATED', message)
  }

  static accountDisabled(message = 'This account is disabled or suspended') {
    return new AppError('ACCOUNT_DISABLED', message)
  }

  static membershipRequired(message = 'Organization membership required') {
    return new AppError('MEMBERSHIP_REQUIRED', message)
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError('FORBIDDEN', message)
  }

  static websiteAccessDenied(message = 'You do not have access to this website') {
    return new AppError('WEBSITE_ACCESS_DENIED', message)
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new AppError('CONFLICT', message, details)
  }
}
