# Supabase Environment — minh-viet-travel-prod

Sprint 1B.1 infrastructure record, updated Sprint 7.5+ after the project was recreated. No secrets appear in this file — see `.env.example` for variable names and the Supabase dashboard for real values.

## Account and project

| Field | Value |
|---|---|
| Organization | `pzhbljirvljsmgoupwln` |
| Project name | `minh-viet-travel-prod` |
| Project ref | `mwurkddnbfqipvziooot` |
| Project URL | `https://mwurkddnbfqipvziooot.supabase.co` |
| Region | `ap-southeast-1` (Singapore) |
| Postgres version | `17.6.1.155` (engine 17, `ga` channel) |
| Status | `ACTIVE_HEALTHY` |
| Created | 2026-08-08 |

**Superseded projects — do not reconnect to any of these:** `mv-travel-os-dev` (`otusjahkdjpxqayeeqqn`, the original Sprint 1B.1 project, superseded 2026-08-08), the unidentified project connected during the Sprint 7 audit (`lkvzxwycvtbmbxnakmtq`), and `minhviet-erp` / `mivigo` (prior/unrelated projects under a different personal account).

Full schema, RLS policies, seeds, and storage buckets (`media-public`/`media-private`, with size/MIME limits) are already provisioned on `minh-viet-travel-prod` — confirmed via `pnpm build` succeeding end-to-end against it (Sprint 7.5+ session). Vercel's Preview/Production environment variables have **not** been confirmed to point at this project yet — verify in the Vercel dashboard before merging to `main`.

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
