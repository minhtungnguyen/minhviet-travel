# Sprint 7 — Tour CMS MVP: Completion Report

Branch: `sprint7-tour-cms-mvp` (pushed to origin). Status date: 2026-08-06.

## Status

| Dimension | Status |
|---|---|
| Functional readiness | **PASS** |
| Runtime verification | **BLOCKED** |
| Production readiness | **BLOCKED BY SUPABASE PROJECT/SCHEMA** |

## Functional readiness — PASS

All seven Sprint 7 priorities are implemented, committed, and wired end-to-end:

| # | Item | Evidence |
|---|---|---|
| 1 | Tour Categories | `modules/tour-categories/*` — full create/update/delete service + repository; `app/admin/tours/categories/actions.ts`; `components/admin/tour-categories-panel.tsx`, `tour-category-picker.tsx` |
| 2 | Destinations | `modules/tour-destinations/*` — tagging CRUD against the existing `destinations` table; `components/admin/tour-destination-picker.tsx` |
| 3 | Tour CRUD | `app/admin/tours/page.tsx` (list), `app/admin/tours/new/page.tsx` (create), edit reuses the shared CMS page editor at `/admin/cms/[id]` since a Tour is a `cms_pages` row (`page_type = 'TOUR'`) |
| 4 | Itinerary Builder | `components/admin/blocks/tour-itinerary-block-form.tsx`, rendered as a `TIMELINE` block |
| 5 | Departure & Pricing | `modules/tour-departures/*` — full create/update/delete; `components/admin/tour-departures-form.tsx`; `app/admin/tours/departures-actions.ts` |
| 6 | Tour Publish | No separate feature — Tours inherit the CMS's existing Draft → Review → Approve → Publish → Schedule lifecycle for free |
| 7 | Public Tour Detail | `app/tour/[slug]/page.tsx` — gallery, itinerary, inclusions/exclusions, policy, booking card, related tours, JSON-LD, wired to `lib/tours/public-tours.ts` |

Verified: `app/admin/cms/[id]/page.tsx` conditionally loads the Tour category picker, destination picker, and departures form only when the edited page's slug has the Tour prefix (`isTour` check) — not stub wiring.

- `pnpm typecheck` — clean.
- `pnpm test` — **186/186 passing** (30 test files).
- `pnpm lint` — 3 pre-existing errors, both outside Tour CMS scope (`app/admin/audit-logs/page.tsx`, `components/site/login-form.tsx` — `<a>` vs `<Link>`); left untouched, no scope creep.

No functional gap was found inside the Sprint 7 scope.

## Runtime verification — BLOCKED

`pnpm build` fails. Root cause is environment, not code.

### Supabase project currently connected

`.env.local` → `NEXT_PUBLIC_SUPABASE_URL=https://lkvzxwycvtbmbxnakmtq.supabase.co` (project ref `lkvzxwycvtbmbxnakmtq`).

This **does not match** the documented canonical project in `docs/infrastructure/supabase-environment.md`:

| Field | Documented canonical value | Currently connected |
|---|---|---|
| Project name | `mv-travel-os-dev` | unknown |
| Project ref | `otusjahkdjpxqayeeqqn` | `lkvzxwycvtbmbxnakmtq` |
| Project URL | `https://otusjahkdjpxqayeeqqn.supabase.co` | `https://lkvzxwycvtbmbxnakmtq.supabase.co` |

`.env.local` was last modified 2026-08-06 (today), consistent with the Supabase MCP session pointing the repo at a different project.

### App tables missing (observed via `PGRST205` during build)

- `public.setting_definitions`
- `public.cms_pages`
- `public.navigation_menus`
- `public.announcements`

These are core platform tables, not Tour-specific — their absence means the connected project carries none of `minh-viet-travel-platform`'s schema, not just the Sprint 7 additions. By direct inference, the Sprint 7 tables (`tour_categories`, `tour_page_categories`, `tour_page_destinations`, `tour_departures`, defined in `database/migrations/0023_tour_cms.sql`) are equally absent on this project — the build never reached a Tour-specific query to confirm this directly, since it aborts earlier on `/admin/cms`.

### Build step that fails

`next build` → `Generating static pages` phase (after `Compiled successfully` and `Finished TypeScript` both succeed). Prerendering `/admin/cms` throws an unhandled `AppError` (`Announcement: unexpected database error`) inside `CmsService.listAnnouncements`, and the export step exits with code 1:

```
Error occurred prerendering page "/admin/cms".
Error [AppError]: Announcement: unexpected database error
Export encountered an error on /admin/cms/page: /admin/cms, exiting the build.
```

### Routes/modules affected

- **Build-fatal:** `/admin/cms` (unhandled during static generation — this is what stops `pnpm build` outright).
- **Degraded but non-fatal** (caught, falls back to static seed content): homepage sections that read `cms_pages`, `setting_definitions`, `navigation_menus`, `announcements`.
- **Untested by this build, but structurally dependent on the same missing schema:** every Tour CMS route — `/admin/tours`, `/admin/tours/new`, `/admin/tours/categories`, `/admin/cms/[id]` (Tour edit), `/tours`, `/tour/[slug]`.

## Guardrails observed while producing this report

- No migration run against the currently connected (unidentified) project.
- No schema recreated from scratch.
- No merge to `main`.
- Sprint 8 not started.
- No UI changes made; no scope expansion beyond the Sprint 7 audit.

## Resolution path (not executed — for the next session)

1. Reconnect `.env.local` to the canonical `mv-travel-os-dev` project (`https://otusjahkdjpxqayeeqqn.supabase.co`), which is documented to already hold the platform schema.
2. Re-run in order: `pnpm typecheck`, `pnpm test`, `pnpm build`.
3. Tour CMS runtime smoke test: create a tour, add a category/destination, add a departure, publish, load `/tour/[slug]`.
