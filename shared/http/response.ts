import { NextResponse } from 'next/server'
import type { AppError, AppErrorCode } from '@/shared/errors/app-error'

/**
 * Envelope shapes are fixed by docs/api/api-conventions.md — every
 * /api/v1/* route handler must return one of these two shapes and
 * nothing else, so clients can branch on `success` alone.
 */
export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: Record<string, unknown>
  requestId: string
}

export type ApiFailure = {
  success: false
  error: {
    code: AppErrorCode
    message: string
    details?: Record<string, unknown>
  }
  requestId: string
}

const ERROR_STATUS: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  ACCOUNT_DISABLED: 401,
  FORBIDDEN: 403,
  MEMBERSHIP_REQUIRED: 403,
  WEBSITE_ACCESS_DENIED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
}

export function ok<T>(data: T, requestId: string, meta?: Record<string, unknown>) {
  const body: ApiSuccess<T> = { success: true, data, meta, requestId }
  return NextResponse.json(body)
}

export function fail(error: AppError, requestId: string) {
  const body: ApiFailure = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      // Never forward `details` for INTERNAL_ERROR — a repository may
      // attach a raw Postgres error code there for server-side logs only
      // (shared/errors/db-error-mapper.ts); master-prompt §13 forbids
      // exposing internal database errors to clients. Enforced here as a
      // second layer, not trusted to every call site remembering it.
      details: error.code === 'INTERNAL_ERROR' ? undefined : error.details,
    },
    requestId,
  }
  return NextResponse.json(body, { status: ERROR_STATUS[error.code] })
}
