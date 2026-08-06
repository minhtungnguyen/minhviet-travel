# Sprint 7.5 — Infrastructure Stabilization: Production Readiness Report

Branch: `sprint7-tour-cms-mvp`. Audit date: 2026-08-07. Audit-only sprint — no migrations run, no schema created, no merge to `main`, no new features built.

---

## Phase 1 — Environment Audit

| Variable | Current | Required | Status |
|---|---|---|---|
| `.env.local` | Present, gitignored (`.gitignore:10-12`), last modified 2026-08-06 | Present for local dev, pointing at `mv-travel-os-dev` | ⚠️ WARNING — present, but 3 keys below are for the wrong project |
| `.env.example` | Present, 17 vars templated (Supabase, webhooks, seed IDs, OneInventory) | Template covering every var the app reads | ⚠️ WARNING — `ANTHROPIC_API_KEY` is read by `shared/env.ts` (required, `.min(1)`) but has no entry here |
| `.env.production` | Does not exist in the repo or working tree | Not required — Vercel manages Production env vars directly, and this file would need to be gitignored if it held secrets | ✅ PASS (expected absence) |
| `NEXT_PUBLIC_SUPABASE_URL` | Local: `https://lkvzxwycvtbmbxnakmtq.supabase.co`. Vercel: set (encrypted), Preview+Production, added 8d ago | `https://otusjahkdjpxqayeeqqn.supabase.co` (`mv-travel-os-dev`, per `docs/infrastructure/supabase-environment.md`) | ❌ BLOCKED locally (confirmed wrong project ref — see Phase 2). Vercel value unverifiable (encrypted) but inferred correct, see note below |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local: set (208 chars). Vercel: set (encrypted) | Anon key matching the canonical project | ❌ BLOCKED locally — paired with the wrong URL, so almost certainly the wrong project's key too |
| `SUPABASE_SERVICE_ROLE_KEY` | Local: set (219 chars). Vercel: set (encrypted) | Service-role key matching the canonical project, server-only | ❌ BLOCKED locally, same reasoning. Vercel: unverifiable, inferred correct |
| `ANTHROPIC_API_KEY` | Not present in `.env.local`, `.env.example`, or Vercel (12 vars listed, this is not one of them) | Required — `shared/env.ts:54` (`z.string().min(1)`), consumed by `integrations/ai/providers/anthropic-tour-import-provider.ts:87-88` for the Sprint 7 AI Import feature | ❌ BLOCKED everywhere — feature will throw at runtime the first time it's invoked, in both local dev and production |
| Vercel Environment | 12 vars set for Preview + Production, all added 8 days ago (`vercel env ls`, read-only) | Should mirror `.env.example` plus `ANTHROPIC_API_KEY` | ⚠️ WARNING — missing `ANTHROPIC_API_KEY`; `SUPABASE_DATABASE_URL` correctly absent from Vercel (local-tooling-only var, and it's empty locally too) |

**Note on Vercel's actual Supabase values:** cannot be decrypted or read directly. Inferred correct because (a) all 12 vars show an unchanged "8d ago" timestamp — no recent edit, unlike `.env.local` which was touched today — and (b) the live production site (Phase 4) renders successfully end-to-end against them. This is inference from indirect evidence, not a direct read.

---

## Phase 2 — Supabase Audit (read-only; no migration, no schema created)

Two things were audited: the **repo's migration/policy definitions** (what should exist) and the **live state of the currently-connected project** `lkvzxwycvtbmbxnakmtq` (what actually exists there). No credentials exist anywhere in this environment for the canonical `otusjahkdjpxqayeeqqn` project, so its live state could not be audited directly.

| Area | Repo definition | Live state (connected project) | Status |
|---|---|---|---|
| Migrations | 22 files, `database/migrations/0001`–`0024`, sequential and readable | N/A | ⚠️ WARNING — `0014` and `0015` were never created (confirmed via `git log --all`, not a deletion) — a harmless numbering gap, not a functional defect |
| Schema / tables | 12 core+Tour tables checked (`cms_pages`, `setting_definitions`, `navigation_menus`, `announcements`, `tour_categories`, `tour_page_categories`, `tour_page_destinations`, `tour_departures`, `destinations`, `media_assets`, `organizations`, `websites`) | **0 of 12 exist** — every probe returned `PGRST205` | ❌ BLOCKED — the connected project has none of this platform's schema |
| Storage buckets | Two buckets expected in code: `media-public`, `media-private` (referenced in 8+ files, e.g. `lib/seo/resolve-media-image.ts`, `app/admin/media/page.tsx`); **not provisioned by any migration/seed SQL** — bucket creation is a manual dashboard step, not code | `GET /storage/v1/bucket` → `[]` (zero buckets) | ❌ BLOCKED on the connected project. Also a process note: buckets are provisioned manually, not via migration — confirm they exist on `mv-travel-os-dev` when reconnecting, since no SQL file will recreate them |
| Auth | N/A | `GET /auth/v1/admin/users` → `{"users":[],...}` (zero users) | ❌ BLOCKED — no identities exist on the connected project |
| RLS | 64 `enable row level security` statements, 134 `create policy` statements across `database/policies/0001`–`0012` | Cannot verify — RLS is meaningless without the underlying tables | ⚠️ WARNING (repo-side definition looks complete and consistent with prior sprints' patterns; live enforcement unverifiable) |
| RPC | e.g. `public_author_display_name(uuid)`, `grant execute ... to anon` (`database/policies/0009`) | `POST /rest/v1/rpc/public_author_display_name` → `PGRST202`, not found. **The 404's own hint suggested a different function: `public.rls_auto_enable`** — a function name that does not appear anywhere in this codebase | ❌ BLOCKED, and this is the strongest single signal in the whole audit: the connected project isn't just empty, it has been touched by tooling unrelated to this codebase, consistent with `docs/infrastructure/supabase-environment.md`'s explicit warning not to point this repo at `minhviet-erp` or `mivigo` |
| Triggers / functions | `set_updated_at()` and similar helpers, defined once and reused via `create trigger ... execute function` across most tables | Unverifiable — no tables to attach to | ❌ BLOCKED, same root cause |

**Conclusion:** the connected Supabase project is not `mv-travel-os-dev` with a stale cache — it is a different project altogether (empty of this app's schema, but not empty of everything). Reconnecting to the correct project, not running any migration, is almost certainly all that Phase 2's blockers need.

---

## Phase 3 — Build Pipeline Audit

| Step | Result |
|---|---|
| `pnpm install` | ✅ PASS — lockfile up to date, no resolution changes |
| `pnpm typecheck` | ✅ PASS — clean |
| `pnpm lint` | ❌ FAIL — 3 pre-existing errors, both outside this sprint's scope: `app/admin/audit-logs/page.tsx:39,45` and `components/site/login-form.tsx:102` (`<a>` instead of `next/link`'s `<Link>`, `@next/next/no-html-link-for-pages`). Not touched, per "no fixes outside scope." |
| `pnpm test` | ✅ PASS — 186/186 tests, 30 files |
| `pnpm build` | ❌ FAIL — exits with code 1 during the `Generating static pages` phase, after `Compiled successfully` and `Finished TypeScript` both succeed |

**Root cause — not one bug, two, both pre-existing and both exposed (not caused) by the Phase 2 schema gap:**

1. **`components/site/announcement-modal-loader.tsx:21`** — `AnnouncementModalLoader()` calls `service.listAnnouncements(WEBSITE_ID)` with no `try`/`catch`. That call chain is `modules/cms/application/cms.service.ts:484-485` → `modules/cms/infrastructure/cms.repository.ts:518-519`, which does `if (error) throw mapDatabaseError(error, 'Announcement')`. `AnnouncementModalLoader` is rendered from `app/layout.tsx` — the root layout — so **every route in the app** carries this exposure. Confirmed as the fatal error on `/admin/cms` (run 1) and `/admin/audit-logs` (run 2).
2. **`components/site/site-footer.tsx:29-38`** — `SiteFooter()` runs a single `Promise.all` of 8 calls. The first (`nav.getPublicMenu(...)`) is guarded with `.catch(() => null)`; the other 7 (`settings.getSetting('company.hotline', ...)` etc.) are not. If any one of those 7 rejects, the whole `Promise.all` rejects and `SiteFooter` — rendered on every public page via `SiteChrome` — throws uncaught. Confirmed as the fatal error on `/insurance/kien-thuc/[slug]` (run 2). This directly contradicts the function's own doc comment: *"Falls back to the previous static content only if the real data is unexpectedly empty, so a settings/navigation outage degrades to 'looks the same as before,' never a blank footer."* — true for the nav call, not true for the 7 settings calls.

Both defects are latent: they would surface identically against the *correct* Supabase project during any transient outage or RLS misconfiguration, not only in this project-mismatch scenario. Which specific page trips the build first is non-deterministic (Next.js runs 7 parallel export workers and exits on the first fatal error encountered), which is why two separate build runs in this audit reported two different failing pages for what is structurally the same class of bug. Not fixed — outside this sprint's declared scope (audit only); flagged for Sprint 8.

---

## Phase 4 — Production Deploy Audit

Vercel project `minh-viet-travel-s-projects/minh-viet`. Custom domain `minhviettravel.com` is aliased to deployment `dpl_Gk8Km4MY2JyGuo4SXN9i1kktBF72`, built from `origin/main`, **7 days old**. Every Sprint 5A/5B/6/7 commit lives on feature branches only — `origin/main`'s newest commit is `0a223b2` ("real auth flow, RBAC-driven Admin Shell, and CMS/Media/Settings admin screens"), which predates News, Tour CMS, and everything audited in Sprints 5–7. **Confirms the "no merge to main" instruction reflects current reality, not just this session's constraint** — nothing from those sprints has ever reached production.

Live checks against `https://minhviettravel.com` (read-only GET requests + `vercel logs`, no state changed):

| Route | HTTP status | Notes |
|---|---|---|
| `/` | 200 | Correct `<title>`, canonical (`https://www.minhviettravel.com`), full OpenGraph set |
| `/tours` | 200 | — |
| `/tour/tokyo` | 200 | Correct canonical + OG (title, description, image, dimensions, locale). **This is the pre-Sprint-7 static demo tour page** (`lib/tours/tour-detail-content.ts` + `public/tour-tokyo.webp`), not the CMS-driven Tour built in Sprint 7 — that code isn't live yet |
| `/tin-tuc` | **404** | News module (Sprint 5A) isn't present in this build |
| `/admin` | 307 → `/login` (200) | Expected, unauthenticated |
| `/admin/media` | 307 → `/login` (200) | Expected, unauthenticated |
| `/robots.txt` | 200 | `Allow: /`, correctly points `Sitemap:` at `https://www.minhviettravel.com/sitemap.xml` |
| `/sitemap.xml` | 200 | Valid XML, but a **static, hand-maintained list** (`/`, `/tours`, `/mice`, `/tour/tokyo`, `/tour/korea`, …) — no dynamic tour/news slugs, consistent with this build predating both modules |
| Runtime errors | none observed | `vercel logs` over the audit window showed only 200/307/404s, no 500s |

SEO/canonical/OpenGraph are all correctly implemented **for what's currently deployed**. They cannot be assessed for Tour CMS or News in production, because neither has shipped.

---

## Phase 5 — Production Readiness Scorecard

| Dimension | Score (0–10) | Basis |
|---|---|---|
| Architecture | 8 | Consistent module boundaries (`modules/*/domain,application,infrastructure`), Tour CMS reuses the CMS page lifecycle instead of duplicating it — deliberate, documented design. Docked for the two unguarded-`Promise`/uncaught-`throw` patterns found in Phase 3, which show the "outage should degrade gracefully" principle isn't applied uniformly. |
| CMS | 8 | Feature-complete per Sprint 7's own audit (categories, destinations, CRUD, itinerary, departures/pricing, publish, public detail) and prior sprints (News, Media, Navigation, SEO, Announcements). Docked because none of it is reachable in production yet — "complete" and "shipped" are different claims. |
| Database | 3 | Repo-side migrations/policies are well-organized (22 migrations, 134 RLS policies across 64 tables) — that part alone would score high. Scored low because the actually-connected project has **zero** of this schema, and storage buckets are a manual, non-migratable step that must be independently confirmed. |
| Environment | 4 | Vercel Production/Preview vars are almost certainly correct and untouched (inferred, not verified). Local `.env.local` points at the wrong project. `ANTHROPIC_API_KEY` is missing everywhere, blocking the AI Import feature entirely regardless of which Supabase project is connected. |
| Security | 7 | `SUPABASE_SERVICE_ROLE_KEY` is confined to `server-only`-guarded modules; no secrets in git (`.env*.local` correctly ignored); 134 RLS policies defined with real scoping (anon-read-when-published patterns, `auth_has_permission(...)` checks). Not scored higher because live RLS enforcement is unverifiable on the connected project, and this audit did not re-review the RLS matrix line-by-line against current policy files. |
| Deployment | 3 | The deployment pipeline itself works (Vercel builds Preview on every branch push, `vercel ls`/`vercel logs` are clean, custom domain is correctly aliased). Scored low because the thing actually being deployed to Production is 7+ sprints stale — Sprint 5A through Sprint 7.5 have accumulated entirely on feature branches with no merge path exercised yet. |
| Maintainability | 8 | Strong precedent of written sprint reports (`docs/backend/admin-os/01`–`16`), code comments that explain *why* (e.g. the Tour-as-`cms_pages` decision, the footer's stated fallback intent), consistent naming/module conventions across 7+ sprints. |
| Performance | Not assessed | No Lighthouse/load testing was run this sprint (out of the declared Phase 1–5 scope). The only concrete data point gathered: the current production Lambda bundles range 627 KB–2.31 MB (`vercel inspect`) — not evaluated against a target, noted for a future dedicated performance pass. |
| **Overall** | **5 / 10 — Production Alpha, not Production Ready** | Code quality and feature completeness are genuinely strong (Architecture/CMS/Maintainability all 8). The score is pulled down entirely by infrastructure state, not code: the wrong Supabase project is connected, one required secret is missing everywhere, and 7+ sprints of finished work have never been merged past feature branches. All three are fixable without writing new code. |

---

## Guardrails observed while producing this report

- No migration run against the connected (unidentified) project.
- No schema created or recreated.
- No merge to `main`.
- Sprint 8 not started.
- No new features built; no fixes applied outside audit scope (the two Phase 3 bugs and the Phase 1 lint errors were documented, not patched).

## Immediate next steps (not executed — for the next session)

1. Reconnect `.env.local` to the canonical `mv-travel-os-dev` project (`https://otusjahkdjpxqayeeqqn.supabase.co`) — do **not** touch Vercel's Production/Preview values, they're inferred healthy.
2. Add `ANTHROPIC_API_KEY` to `.env.local`, `.env.example` (as a blank template entry), and Vercel (Preview + Production).
3. Confirm `media-public` / `media-private` buckets exist on `mv-travel-os-dev` (manual step, not migratable).
4. Re-run `pnpm typecheck && pnpm test && pnpm build` against the reconnected project.
5. Fix the two Phase 3 resiliency bugs (`announcement-modal-loader.tsx`, `site-footer.tsx`) before the next production deploy, independent of which Supabase project is connected.
6. Plan the `main` merge path for Sprint 5A → 7.5 — this is the largest single gap between "code is done" and "feature is live."
