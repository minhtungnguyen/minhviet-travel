import { describe, expect, it, vi } from 'vitest'
import type { PostgrestError } from '@supabase/supabase-js'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'

function fakeError(code: string): PostgrestError {
  const error = { code, message: 'db message', details: '', hint: '', name: 'PostgrestError' }
  return { ...error, toJSON: () => error } as PostgrestError
}

describe('mapDatabaseError', () => {
  it('maps unique_violation (23505) to CONFLICT', () => {
    expect(mapDatabaseError(fakeError('23505'), 'Website').code).toBe('CONFLICT')
  })

  it('maps foreign_key_violation (23503) to VALIDATION_ERROR', () => {
    expect(mapDatabaseError(fakeError('23503'), 'Website').code).toBe('VALIDATION_ERROR')
  })

  it('maps check_violation (23514) to VALIDATION_ERROR', () => {
    expect(mapDatabaseError(fakeError('23514'), 'Website').code).toBe('VALIDATION_ERROR')
  })

  it('maps insufficient_privilege (42501, an RLS denial) to FORBIDDEN', () => {
    expect(mapDatabaseError(fakeError('42501'), 'Website').code).toBe('FORBIDDEN')
  })

  it('maps PostgREST no-rows (PGRST116) to NOT_FOUND', () => {
    expect(mapDatabaseError(fakeError('PGRST116'), 'Website').code).toBe('NOT_FOUND')
  })

  it('maps an unrecognized code to INTERNAL_ERROR without leaking the raw code in the message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const mapped = mapDatabaseError(fakeError('55P03'), 'Website')
    expect(mapped.code).toBe('INTERNAL_ERROR')
    expect(mapped.message).not.toContain('55P03')
    expect(mapped.details).toBeUndefined()
    vi.restoreAllMocks()
  })
})
