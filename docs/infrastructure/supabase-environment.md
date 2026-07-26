# Supabase Environment — mv-travel-os-dev

Sprint 1B.1 infrastructure record. No secrets appear in this file — see `.env.example` for variable names and the Supabase dashboard for real values.

## Account and project

| Field | Value |
|---|---|
| Supabase account | `dev@***@minhviettravel.com` (masked) |
| Organization | Minh Viet Travel (`tbmdjgtcohesrslhgwnf`) |
| Project name | `mv-travel-os-dev` |
| Project ref | `otusjahkdjpxqayeeqqn` |
| Project URL | `https://otusjahkdjpxqayeeqqn.supabase.co` |
| Region | `ap-southeast-1` (Singapore) |
| Postgres version | `17.6.1.147` (engine 17, `ga` channel) |
| Status at provisioning check | `ACTIVE_HEALTHY` |
| Created | 2026-07-25 |

This is a dedicated project — do not point this repository's environment variables at `minhviet-erp` or `mivigo` (prior/unrelated Supabase projects under a different personal account) at any point.

## Environment variables

Defined in `.env.example`. Required for the app to run against this project:

| Variable | Purpose | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public API base URL | `mcp: get_project_url`, or Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon/publishable key, RLS-protected | `mcp: get_publishable_keys`, or Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, bypasses RLS | Project Settings > API — **manual**, not retrievable via MCP |
| `SUPABASE_DATABASE_URL` | Direct Postgres connection string, for migration tooling | Project Settings > Database — **manual**, not retrievable via MCP |
| `DEFAULT_ORGANIZATION_ID` / `DEFAULT_BRAND_ID` / `DEFAULT_WEBSITE_ID` | Seeded UUIDs the app defaults to | Filled in after Phase 4 seeding |
| `APP_URL` / `ADMIN_APP_URL` | Local dev URLs | `http://localhost:3000` |
| `LOG_LEVEL` | App log verbosity | `info` |

`.env.local` holds the real values for local development and is git-ignored (verified: `.gitignore:12` — `.env*.local`). It was populated with the project URL and anon key (both public-safe by design); the service-role key and database URL were left blank because this MCP session has no tool to retrieve secret keys — the project owner must copy them from the Supabase dashboard directly into `.env.local`, never into chat, a terminal command, or a doc.

## Rules enforced

- `shared/supabase/server-client.ts` is `import 'server-only'` — a client-component import of a service-role-capable client fails the build.
- No `NEXT_PUBLIC_`-prefixed variable ever holds `SUPABASE_SERVICE_ROLE_KEY`.
- No secret value appears in this document, in `.env.example`, in terminal output, or in any Sprint 1B.1 report.
