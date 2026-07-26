# Security Checklist — Sprint 1

Per master-prompt §17: "Do not claim a security feature is complete unless it is actually implemented and tested." Status reflects Sprint 1A (architecture-only) reality.

| Item | Status |
|---|---|
| Supabase Auth session validation | Contract defined (`shared/auth/session.ts#resolveActor`), not implemented — no live project |
| Row Level Security | **Written** for every Sprint 1 table (`database/policies/`), not yet applied to any project |
| Server-only service-role usage | Enforced by `import 'server-only'` in `shared/supabase/server-client.ts`; no real client exists yet |
| Input validation (Zod) | Implemented for the two reference modules' schemas; the pattern is documented for the rest |
| Output filtering | Response envelope (`shared/http/response.ts`) never echoes raw DB errors; `AppError` messages are hand-written, not derived from Postgres error text |
| HTML sanitization / XSS prevention | Structural (CMS blocks are typed JSON, not raw HTML) — see `docs/security/security-model.md`; no sanitizer library added since nothing renders free-text HTML in Sprint 1A |
| CSRF strategy | **Not implemented.** Next.js Server Actions have built-in CSRF protection; `/api/v1` route handlers using cookies for auth will need same-site cookie config decided in Sprint 1B |
| Secure cookies | Deferred to Sprint 1B (Supabase Auth cookie config) |
| CORS strategy | Deferred — no cross-origin API consumer identified yet for Sprint 1 |
| Rate limiting | Extension point only (`AppErrorCode.RATE_LIMITED` exists; no limiter implemented) |
| Brute-force protection | Deferred to Supabase Auth's own rate limiting (Sprint 1B config, not custom code) |
| File upload restrictions (MIME/size) | Columns exist (`media_assets.mime_type`, `.file_size_bytes`) for the service layer to validate against; validation logic itself is Sprint 1B (needs a real upload path) |
| Signed URLs for private files | Deferred — `media_assets.visibility = 'PRIVATE'` is modeled; actual signed-URL generation needs a live Storage bucket |
| Permission enforcement (service + RLS) | **Both layers implemented** for the two reference modules; RLS implemented for all Sprint 1 tables |
| Audit logging | Schema + append-only enforcement (trigger + RLS) implemented; the actual logger call-sites are Sprint 1B (needs live DB to write to) |
| Secret management | Pattern documented and structurally enforced (`docs/security/secret-management.md`); no real secret exists to test against yet |
| Secure error responses | Implemented (`shared/http/handle-route.ts` never leaks a caught error's message to the client) |
| Dependency security | Not audited in this sprint — no new runtime dependency was added (Sprint 1A adds zero npm packages) |
| Security headers | Deferred to Sprint 1B (`next.config.mjs` — no headers configured yet) |

## Before Sprint 1B ships

Re-run this checklist with every "deferred"/"not implemented" row addressed or explicitly re-deferred with a reason, per master-prompt §35 (verification must show real command output, not a claim).
