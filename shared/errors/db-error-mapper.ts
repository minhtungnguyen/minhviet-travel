import type { PostgrestError } from '@supabase/supabase-js'
import { AppError } from '@/shared/errors/app-error'

/**
 * Translates a raw Postgres/PostgREST error into an `AppError` so no
 * repository ever leaks a SQLSTATE code or constraint name to a client
 * (master-prompt §13). Every repository method that can fail calls this
 * in its `catch`, rather than re-deriving the mapping inline.
 */
export function mapDatabaseError(error: PostgrestError, context: string): AppError {
  switch (error.code) {
    case '23505': // unique_violation
      return AppError.conflict(`${context}: a record with this value already exists`)
    case '23503': // foreign_key_violation
      return AppError.validation(`${context}: references a record that does not exist`)
    case '23514': // check_violation
      return AppError.validation(`${context}: value violates a database constraint`)
    case '42501': // insufficient_privilege (RLS denial)
      return AppError.forbidden(`${context}: not permitted`)
    case 'PGRST116': // PostgREST: 0 or >1 rows for a .single() query
      return new AppError('NOT_FOUND', `${context}: not found`)
    default:
      // Logged here (server-side only) since this is already an AppError
      // by the time it reaches shared/http/handle-route.ts's catch block,
      // which only logs uncaught non-AppError exceptions.
      console.error(`[db-error-mapper] ${context}:`, error.code, error.message)
      return new AppError('INTERNAL_ERROR', `${context}: unexpected database error`)
  }
}
