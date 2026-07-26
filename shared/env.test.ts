import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPublicEnv, getServiceRoleEnv } from '@/shared/env'

describe('env validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('getPublicEnv() throws with a clear message when a variable is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    expect(() => getPublicEnv()).toThrow(/Supabase public environment variables/)
  })

  it('getPublicEnv() returns the parsed values when valid', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-value')
    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-value',
    })
  })

  it('getServiceRoleEnv() throws when the service-role key is missing even if public vars are set', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-value')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    expect(() => getServiceRoleEnv()).toThrow(/service-role environment variables/)
  })
})
