/**
 * Minimal structured server-side logger. Every log line carries the
 * request id so a single request can be traced end-to-end alongside
 * `audit_logs.request_id` (docs/architecture/system-overview.md).
 *
 * "Safe" means: never call this with a raw secret, password, token, or
 * full Supabase connection string — the same rule `docs/security/
 * secret-management.md` applies to terminal output and docs applies here.
 */

type LogFields = Record<string, unknown>

function write(level: 'info' | 'warn' | 'error', requestId: string, message: string, fields?: LogFields) {
  const line = { level, requestId, message, ...fields, timestamp: new Date().toISOString() }
  const serialized = JSON.stringify(line)
  if (level === 'error') console.error(serialized)
  else if (level === 'warn') console.warn(serialized)
  else console.log(serialized)
}

export const logger = {
  info: (requestId: string, message: string, fields?: LogFields) => write('info', requestId, message, fields),
  warn: (requestId: string, message: string, fields?: LogFields) => write('warn', requestId, message, fields),
  error: (requestId: string, message: string, fields?: LogFields) => write('error', requestId, message, fields),
}
