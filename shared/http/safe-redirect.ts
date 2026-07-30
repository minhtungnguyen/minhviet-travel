/**
 * Whitelists a redirect target so `?next=`/`?redirectTo=`-style params
 * (login, /auth/callback, proxy.ts) can never send a user off-site.
 * Only a same-origin relative path is accepted: must start with exactly
 * one `/` (rejects `//evil.com` — a protocol-relative URL) and must not
 * contain `://` or start with `/\` (both browser-normalized to an
 * absolute URL by some clients).
 */
export function safeRedirectPath(candidate: string | null | undefined, fallback: string): string {
  if (!candidate) return fallback
  if (!candidate.startsWith('/')) return fallback
  if (candidate.startsWith('//')) return fallback
  if (candidate.startsWith('/\\')) return fallback
  if (candidate.includes('://')) return fallback
  return candidate
}
