# Sprint 1 Repository Audit — MV Travel OS Backend Foundation

**Date:** 2026-07-25
**Scope:** Phase 0 of the "MV Travel OS Backend Foundation — Sprint 1" master prompt.
**Method:** Direct inspection of the repository (`git log`, `package.json`, `tsconfig.json`, `next.config.mjs`, source tree, existing docs). No code changed. No migrations created.

---

## 0. Headline finding — a scope conflict must be resolved before Phase 1 starts

This repository already has an authoritative product/architecture governance layer that a fresh backend implementation must not silently override:

- `MV_Operating_System/docs/volume-00-foundation/` — **Volume 00 — Foundation**, including `CLAUDE.md` (the acting engineering charter for this exact repo), `04-technical-stack.md`, `07-module-map.md`, `02-business-scope.md`, and `rules/scope-lock.md`.
- A prior full-repo audit, `PROJECT_AUDIT.md` (2026-07-18), scored against Volume 00 and Volume 01 (Design DNA).

Volume 00 defines a **single-site, single-tenant V1** for `minhviettravel.com` only:

| Dimension | Volume 00 (existing governance) | This master prompt ("MV Travel OS Sprint 1") |
|---|---|---|
| Sites in scope | `minhviettravel.com` only for V1 go-live | 6+ websites/brands (`minhviettravel.com`, `vemaybay.minhviettravel.com`, `minhvietbooking.com`, `mivigo.vn`, `vevuichoi.vn`, `checkincatba.com`) modeled from day one |
| Tenancy model | Not modeled — one product, one brand | Organization → Brand → Website → Business Unit → Office hierarchy, multi-brand by design |
| Roles | 8 fixed roles: `SUPER_ADMIN, ADMIN, MANAGER, SALES, BOOKING, OPERATION, MARKETING, VIEWER` | 13 roles incl. `ORGANIZATION_ADMIN, DIRECTOR, DEPARTMENT_MANAGER, MARKETING_MANAGER, CONTENT_EDITOR, SEO_EDITOR, ACCOUNTANT, CUSTOMER_SERVICE`, plus scoped permissions (org/brand/website/business-unit/own/assigned/all) |
| Sprint 1 business content | CMS for real products (tour/hotel/cruise/ticket CRUD) — see `08-roadmap-v1.md` mapping in `PROJECT_AUDIT.md` §7 | Explicitly excludes all product/CRM/booking modules; builds only platform kernel (org, RBAC, settings, master data, media, CMS *shell*, forms, SEO, audit, notifications, integration registry) |
| CRM / Booking Request | P0, required for go-live (`07-module-map.md` §3–4) | Explicitly out of scope for Sprint 1 (§28) |
| Explicit governance rule | `rules/scope-lock.md`: reject anything that "serves a scale that doesn't exist yet," has "no specific V1 user," or "requires a multi-vendor marketplace" — multi-site/multi-brand infra for brands with zero current traffic matches this rejection criteria almost verbatim | Section 3.2 explicitly asks to build multi-site/multi-brand foundation "even though only Minh Việt Travel may be active initially" |

This is not a cosmetic difference — it changes the primary keys and ownership model of nearly every table (whether `website_id`/`brand_id`/`organization_id` are required FKs from day one), the RBAC role table contents, and what Sprint 1 is allowed to touch. The master prompt's own Section 37 instructs me to stop rather than proceed when "existing implementations fundamentally conflict" or "a significant architectural choice has multiple incompatible options." This qualifies on both counts, so Phase 1+ (schema, migrations, RLS, APIs) has **not** been started pending a decision. See the question at the end of this document.

Everything below is descriptive audit content, safe regardless of which direction is chosen.

---

## 1. Existing architecture

- **Framework:** Next.js 16.2.6, App Router, React 19, TypeScript strict (`tsconfig.json` has `"strict": true`; `next.config.mjs` no longer sets `ignoreBuildErrors` — that flag from the 2026-07-18 audit has since been removed).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/ui configured (`components.json`, style `base-nova`) on top of `@base-ui/react` instead of Radix.
- **No backend of any kind exists today:**
  - No `supabase/` directory, no Supabase client anywhere in `package.json` dependencies, no `SUPABASE_*` env vars in `.env.example`.
  - No `app/api/` route handlers.
  - No `app/admin`.
  - No auth: `app/login`, `app/register`, `components/site/login-form.tsx`, `register-form.tsx` are static forms that `preventDefault()` and show "Cổng khách hàng đang được phát triển" (customer portal under development). Honest, not fake-success, but there is nothing to connect to.
  - No database migrations, no ORM, no query layer.
- **What does exist and is real:**
  - `lib/actions/lead-action.ts`, `newsletter-action.ts`, `ai-advisor-action.ts` — real Next.js Server Actions, Zod-validated, POST to a `LEADS_WEBHOOK_URL` / `NEWSLETTER_WEBHOOK_URL` env var (currently unset — logs server-side only). This is the only "backend-shaped" code in the repo.
  - `lib/cms/client.ts` + `lib/cms/schema.ts` — a single well-designed seam: `getHomepageContent()` returns Zod-validated `HomepageContent` from a local seed file (`lib/cms/content/homepage.seed.ts`), with an explicit comment that swapping in a real CMS/Supabase fetch requires no changes to any consuming component. This is the correct shape for the future CMS content-read path but currently has no write path and only covers the homepage.
  - `lib/site-data.ts` — ~510 lines of hardcoded tour/partner/menu data with no schema, consumed directly by `/tours`, `/tour/[slug]`, `why-choose.tsx`, `partners.tsx`. Flagged repeatedly in `PROJECT_AUDIT.md` as needing migration to the `journeyContentSchema` pattern.
  - `types/cms.ts`, `types/tour-availability.ts` — hand-written Zod-adjacent types with explicit business rules embedded in comments (e.g. no invented countdowns, no seat-counters), evidence of a prior audit-and-fix pass already applied to the homepage only.
- **Git:** now a proper repository (the 2026-07-18 audit's "not a git repo" finding has been resolved) — 17 commits, `master` branch, no `main`. Working tree currently has uncommitted, in-progress changes unrelated to this task: `contact-form.tsx`, `tour-card.tsx`, `why-choose.tsx` modified and `flash-deals.tsx` deleted — these match `PROJECT_AUDIT.md` §3.6/§4/§5 recommendations (wiring `/contact` to a real lead action, removing the dead fake-countdown component). **These files must not be touched or committed as part of Sprint 1 work** — they belong to a different, already in-flight task.
- **Testing:** zero test files in the whole repo (`lib/tours/availability.test.ts` exists as the sole exception — one Vitest-style test colocated with `lib/tours/availability.ts`, but there is no test runner configured in `package.json` scripts and no `vitest`/`jest` dependency, so it cannot currently execute).
- **Docs:** three parallel documentation trees — `MV_Operating_System/docs/volume-00-foundation` (Foundation/charter, authoritative for scope), `MV_Operating_System/docs/volume-01-design-dna` (design tokens/rules), and `MV_Operating_System/volume/volume-02-design` (a second, uncontrolled design doc set the prior audit flagged as a governance violation — not relevant to backend work but noted for completeness).

## 2. Reusable components

- `lib/cms/client.ts` + `schema.ts` pattern — reuse this exact shape (server-only cached fetcher + Zod parse boundary) as the model for every new module's read path.
- `lib/actions/*.ts` + companion `hooks/use-*-form.ts` — reuse this Server Action + Zod + honest-failure pattern for the Forms Foundation module; `submitLeadAction` is the closest existing analog to `form_submissions`.
- Zod is already a first-class citizen (`zod ^4.4.3`) — no need to introduce another validation library.
- `tsconfig.json` path alias `@/*` → repo root is already set up; new `src/`-rooted modules (if adopted) will need either a path update or living at repo root to match.

## 3. Conflicting implementations

- **Scope conflict** described in §0 above — the biggest one, blocking.
- **Three parallel button/card component systems** (`components/ui/button.tsx`, `components/mv/mv-button.tsx`, `design-system/components/button/Button.tsx`) — a frontend concern, out of scope for backend Sprint 1, but relevant if any admin UI is built: default to `components/ui` + `components/mv` (the ones actually in use), not `design-system/` (documented as intentionally unwired).
- **Two data tiers** on the frontend (CMS-seam vs. `lib/site-data.ts` hardcode) — the CMS foundation module in this sprint should be designed so `lib/site-data.ts` content can eventually migrate into it, but migrating existing pages is explicitly out of scope per the master prompt (§28, "complete product catalogue").

## 4. Missing infrastructure

Everything in Section 8 of the master prompt is currently absent: no Supabase project wiring, no auth, no RBAC, no settings, no master data, no media library, no CMS write path, no navigation backend, no forms backend, no SEO backend, no audit log, no notifications, no integration registry. This repo is 100% frontend today. There is also no `docs/architecture/`, `docs/database/`, `docs/api/`, or `docs/security/` directory yet — all documentation deliverables in master-prompt §25 are net-new.

## 5. Technical risks

- **No Supabase project exists yet** (confirmed: no `.mcp.json` Supabase entry active, no env vars, no CLI config). Sprint 1 cannot create real migrations against a live database until a project is provisioned — this is a "production credentials required" stop condition per the master prompt's own §37 exception list.
- **`components.json` has `"config": ""`** — flagged in the prior audit as needing confirmation this is intentional Tailwind v4 CSS-first behavior rather than a misconfiguration. Not a backend blocker but worth a sanity check before wiring an admin UI through shadcn generators.
- **No test runner configured** — `vitest`/`jest` must be added before Section 23's testing requirements can be met; this is new infrastructure, not a fix.
- **In-flight uncommitted frontend changes** (see §1) create a risk of accidental interference if backend work touches the same files (it should not need to).

## 6. Recommended migration approach

Given the scope conflict in §0 is unresolved, no migration path is recommended yet beyond: whichever direction is chosen, start Phase 1 (shared infrastructure: Supabase server client, error/response envelope, auth helpers) since that code is identical either way. The organization/brand/website schema (Phase 2) is the first place the two directions diverge and should not be started until the conflict is resolved.

## 7. Files that should be retained

- `lib/cms/client.ts`, `lib/cms/schema.ts`, `types/homepage.ts`, `types/cms.ts` — model for the CMS foundation's read boundary.
- `lib/actions/*.ts`, `hooks/use-lead-form.ts` — model for the Forms foundation.
- All existing public routes/components — must keep working per master-prompt §33 and §6 acceptance criteria.

## 8. Files that should be refactored (later, in-scope phases)

- None identified as required for Sprint 1 itself — Sprint 1 is additive (new `modules/`, `app/api/v1/`, `database/migrations/`). No existing file needs modification to add the backend kernel, except wiring `app/login`/`app/register` to real Supabase Auth once Phase 2 lands (out of scope until the org/RBAC schema is settled).

## 9. Files that should not be touched

- `components/site/contact-form.tsx`, `components/site/tour-card.tsx`, `components/site/why-choose.tsx`, `components/site/flash-deals.tsx` (deleted) — in-flight unrelated work, currently uncommitted in the working tree.
- Everything under `design-system/`, `MV_Operating_System/volume/volume-02-design/` — explicitly out of scope, governed by a separate product decision per the prior audit.

## 10. Implementation plan

Blocked pending the decision in §0. Once resolved, proceed per the master prompt's Phase 1–7 sequencing (`docs/backend/sprint-1-implementation-plan.md` to be written immediately after the decision, before any migration is created).

---

## Decision needed before Phase 1

Volume 00 (this repo's existing, checked-in engineering charter) scope-locks V1 to a single site with 8 roles and treats CRM/Booking as go-live blockers. The master prompt asks for a 6-site, multi-brand, 13-role platform kernel that explicitly defers CRM/Booking. I do not have the business authority to decide which document governs — that is a product ownership call, not something inferable from code. Options, concretely:

1. **Follow Volume 00 as-is** — build single-tenant (org/website of one), 8 roles, and fold CRM/Booking into this sprint's foundation so it lines up with the existing roadmap in `PROJECT_AUDIT.md` §7.
2. **Follow the master prompt as-is** — supersede Volume 00's V1 scope lock with the multi-site MV Travel OS vision, and treat this as a deliberate, documented scope-lock exception (per `rules/scope-lock.md`'s own change-management process, which requires recording the reason).
3. **Hybrid** — build the schema multi-site/multi-brand-capable from day one (cheap: extra nullable FK columns + one extra table) but only seed/activate `minhviettravel.com`, keep the 8-role list for now, and leave CRM/Booking Request explicitly as "Sprint 2" per Volume 00's existing roadmap rather than silently dropping them.

I'd recommend option 3 as the lowest-regret path — it satisfies the master prompt's own §36 principle 15 ("Sprint 1 builds the foundation only") without violating scope-lock, and doesn't foreclose either roadmap. But this is your call to make, not mine.
