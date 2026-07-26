# Secret Management

## Rule

No table in `database/migrations/` stores a secret value. One pattern enforces this today, one is a documented convention for when its owning table returns:

1. **`setting_definitions.is_secret`** (`database/migrations/0006_settings.sql`) — a definition flagged `is_secret = true` may never have its value written through `setting_values` at all; the RLS write policy (`staff_write_setting_values` in `database/policies/0003_internal_tables_policies.sql`) explicitly blocks any write where the target definition is secret. Secret-backed settings are configured via environment variables directly, not through the Settings UI.
2. **A future `integration_connections.secret_ref`** — the Integration Registry module was deferred entirely in Sprint 1A.2 (`docs/backend/sprint-1a2-reduction-report.md` §6), so this table doesn't exist yet. When it returns, the same convention applies: a text pointer (e.g. `'env:RESEND_API_KEY'`), never the secret itself. Until then, a provider's credential is just an environment variable a hardcoded provider implementation reads directly (`docs/playbooks/add-future-api-provider.md`).

## Server-only enforcement in code

`shared/supabase/server-client.ts` is marked `import 'server-only'` — if any client component ever imports it, the build fails rather than shipping a service-role-capable client to the browser. The Supabase **anon** key is the only Supabase key ever allowed in client-side code; the **service role** key is used exclusively in `shared/supabase/server-client.ts` (once Sprint 1B implements it) for the small set of operations that must bypass RLS (audit log writes, public form submission inserts — see `docs/database/rls-policy-matrix.md`).

## Environment variables

See `.env.example` for the current set (includes this sprint's unrelated `LEADS_WEBHOOK_URL`/`NEWSLETTER_WEBHOOK_URL`). Sprint 1B.1 added, against the now-live `mv-travel-os-dev` project:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never NEXT_PUBLIC_
SUPABASE_DATABASE_URL=
DEFAULT_ORGANIZATION_ID=
DEFAULT_BRAND_ID=
DEFAULT_WEBSITE_ID=
APP_URL=
ADMIN_APP_URL=
LOG_LEVEL=
```

Never prefix a secret with `NEXT_PUBLIC_` — that prefix is Next.js's signal to inline the value into the client bundle. `SUPABASE_SERVICE_ROLE_KEY` in particular must never carry it.

## Sprint 1B.1 status

`.env.local` (git-ignored) now holds real values for the project URL and anon key — both are public-safe by design (RLS-protected). `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DATABASE_URL` are left blank: no tool available in this session can retrieve them, and they must never be printed in chat, a terminal command, or a doc — the project owner copies them directly from the Supabase dashboard (Project Settings → API / Database) into `.env.local`. Full deployment detail: `docs/backend/sprint-1b1-database-deployment-report.md`.
