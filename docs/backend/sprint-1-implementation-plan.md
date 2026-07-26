# Sprint 1 Implementation Plan — MV Travel OS Backend Foundation

**Status:** Approved to proceed as **Sprint 1A — architecture only.**
Sprint 1B (provisioning a real Supabase project, executing migrations, wiring live route handlers) starts only after this plan and the artifacts it describes are reviewed.

This plan records the decisions made in response to the scope conflict raised in `sprint-1-repository-audit.md` §0, and the concrete file-by-file plan for Sprint 1A.

---

## 1. Scope decisions (binding for Sprint 1A and 1B)

### 1.1 Multi-site/multi-brand: **hybrid**

- Schema is multi-site/multi-brand-capable from day one: `organizations → brands → websites`, plus `business_units`, `offices`, `departments`, `positions` as described in master-prompt §8.1, using normalized ownership FKs (not a blind `organization_id`/`brand_id`/`website_id` triplet bolted onto every table — only tables that are genuinely site- or brand-scoped carry those columns; see `docs/database/data-dictionary.md`).
- Only **Minh Việt Travel** (organization), **Minh Việt Travel** (brand), and **minhviettravel.com** are seeded as `ACTIVE`.
- `vemaybay.minhviettravel.com` is seeded as a website record with status `PLANNED` (satisfies master-prompt §30 acceptance criteria: "minhviettravel.com and vemaybay.minhviettravel.com exist as separate website records") — no flight-specific tables or routes are built.
- `mivigo.vn`, `vevuichoi.vn`, `minhvietbooking.com`, `checkincatba.com` are **not seeded**. Adding them later is a data-only operation (`docs/playbooks/add-new-website.md`), not a schema change — that is what "multi-site-capable" buys us here.

### 1.2 Roles: **Volume 00's 8-role list, not the master prompt's 13**

Volume 00 (`04-technical-stack.md`) is this repo's checked-in engineering charter and defines:

```
SUPER_ADMIN, ADMIN, MANAGER, SALES, BOOKING, OPERATION, MARKETING, VIEWER
```

Sprint 1A seeds exactly these 8 roles. The RBAC schema itself (`roles`, `permissions`, `role_permissions`, `user_roles`, `role_scopes`) supports arbitrary future roles and scoped permissions (organization/brand/website/business-unit/own/assigned/all, per master-prompt §8.3) without a schema change — adding a 9th role later is a data operation (`docs/playbooks/add-new-role.md`).

### 1.3 CRM / Booking Request: **deferred to Sprint 2, explicitly, not silently dropped**

Per master-prompt §28 these are out of scope for this sprint. Per Volume 00 (`07-module-map.md`) they are P0 for go-live. The hybrid resolution: **no CRM/booking tables are created in Sprint 1A**, and `docs/architecture/future-travel-domains.md` explicitly names CRM and Booking Request as the first Sprint 2 domains, reusing the Forms Foundation (`form_submissions`) built in Sprint 1A as their intake mechanism. This keeps Volume 00's roadmap intact rather than overriding it.

### 1.4 Sprint 1A vs. Sprint 1B

| | Sprint 1A (this pass) | Sprint 1B (later, on approval) |
|---|---|---|
| Supabase project | None provisioned | Created, dev + prod |
| Migrations | Written and committed under `database/migrations/`, **not executed** | Run against a real project via Supabase CLI |
| Env vars | None required to build/typecheck | `.env.local` populated from `.env.example` |
| RLS policies | Written as SQL, reviewed on paper | Applied and tested against real auth sessions |
| Service/repository layer | TypeScript interfaces + Zod schemas + Supabase-client-shaped repository contracts, compiling but not exercised against a live DB | Wired to real `@supabase/supabase-js` clients, integration-tested |
| API routes | Documented contracts (`docs/api/sprint-1-endpoints.md`); route handler stubs only where they don't require a DB | Fully implemented and tested |
| Seed data | SQL written | Executed against dev project |

No code in Sprint 1A imports `@supabase/supabase-js` or requires any `SUPABASE_*` environment variable to exist for `pnpm build` / `pnpm typecheck` to succeed — this was an explicit constraint from the user.

### 1.5 Folder structure: extend the existing root layout, do not introduce `src/`

The repo has no `src/` today; everything lives at repo root (`app/`, `components/`, `lib/`, `hooks/`, `types/`), with `tsconfig.json`'s `@/*` alias pointing at the repo root. Master-prompt §15's proposed `src/...` tree is adapted to this existing convention instead of introducing a parallel root:

```
modules/                     (was "src/modules/")
  organization/
    domain/                  types, enums
    schemas/                 zod schemas
    application/             service layer (business logic)
    infrastructure/          repository implementations (Supabase-shaped)
    api/                     route-handler-facing contracts
  access-control/             (identity + RBAC — combined, see §2)
  settings/
  master-data/
  media/
  cms/
  forms/
  seo/
  notifications/
  audit/
  integrations/               (registry model, not the connector code below)

integrations/                (was "src/integrations/" — kept top-level per master-prompt §9,
                              distinct from modules/integrations which is just the registry schema)
  core/
  flight/
    contracts/
  attraction-ticket/
    contracts/
  email/
    contracts/
    providers/                (a real provider is out of scope; only the interface + a
                                no-op console provider, so Forms/Notifications have
                                something to call in Sprint 1A)
  ai/
    contracts/

shared/
  errors/
  http/                       (response envelope, request id)
  supabase/                   (server client factory — typed, not connected until 1B)
  validation/
  auth/                       (session/permission helper contracts)

database/
  migrations/                 numbered SQL, one concern per file
  policies/                   RLS policy SQL, mirrors migrations by module
  seeds/                      idempotent seed SQL
```

`app/api/v1/...` (route handlers) stays under the existing `app/` directory per Next.js App Router convention — there is no reason to relocate it.

---

## 2. Module grouping for Sprint 1A

The master prompt lists "Authentication and User Module" and "RBAC Module" separately (§8.2, §8.3). They are implemented as one `modules/access-control/` module because in this codebase they share the same tables' lifecycle (a `user_profiles` row is meaningless without a role) and the same repository — splitting them into two modules with no live DB yet would create two thin shells referencing each other. This is a Sprint-1A implementation grouping only; it does not change any table name or the module boundaries documented in `docs/architecture/module-boundaries.md`.

## 3. Phases (this pass)

1. Shared infrastructure contracts (`shared/`) — error types, response envelope shape, Supabase server client factory (typed, unconnected).
2. Database: extensions, shared enums/trigger functions, then one migration file per Sprint-1 sub-module (organization → access-control → settings/master-data → media/CMS/navigation → forms/SEO → notifications/integrations/audit), each immediately followed by its RLS policy file.
3. ERD written directly from the migration files (not from the master prompt's suggested table list) so it cannot drift from what was actually built.
4. Reference module: `modules/organization/` and `modules/access-control/` fully fleshed out (domain → schema → repository interface → service → API contract) as the pattern the remaining 10 modules follow. The remaining modules get schema + migration + RLS in full, but only a thinner domain/schemas layer — writing full service/repository code for all 12 modules against a database that doesn't exist yet is speculative work the user did not ask for and master-prompt §36 principle 19 ("do not over-engineer") argues against.
5. Seed SQL.
6. Remaining documentation (architecture, API conventions/endpoint list/error codes, security, playbooks, data dictionary, migration strategy).
7. Verification: `pnpm typecheck`, `pnpm lint`, `pnpm build` against the unchanged frontend + new TypeScript contracts, to confirm Sprint 1A adds zero regressions. Implementation report.

## 4. Out of scope for Sprint 1A (unchanged from master prompt §28, plus)

Everything master-prompt §28 excludes, plus (specific to the "no live DB" constraint): no Supabase project, no `.env.local`, no executed migration, no integration test that requires a database connection, no admin UI pages (there is nothing yet for them to call).
