import { randomUUID } from 'node:crypto'

/**
 * Every route handler calls this once at the top and threads the result
 * through both the success/failure envelope and structured logs, so a
 * single request can be traced end-to-end (docs/architecture/system-overview.md).
 */
export function newRequestId(): string {
  return randomUUID()
}
