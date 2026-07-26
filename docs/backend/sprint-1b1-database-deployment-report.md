# Sprint 1B.1 — Database Deployment and Security Verification Report

**Status: COMPLETE.** All phases (0–9) executed against the live `mv-travel-os-dev` Supabase project. No secret value appears anywhere in this report.

---

## 1. Supabase account and organization confirmation

The Supabase MCP connection was initially authenticated under the wrong account (a personal account, organization "minhtungnguyen's Org", exposing unrelated prior projects `minhviet-erp` and `mivigo`). Per the Phase 0 stop condition, work halted immediately and the owner re-authenticated the MCP session as **dev@minhviettravel.com**. Re-verified afterward:

- Organization: **Minh Viet Travel** (id `tbmdjgtcohesrslhgwnf`)
- Only one project visible under this org/account: `mv-travel-os-dev` — confirming no accidental cross-project ambiguity.

## 2. Project reference

- Name: `mv-travel-os-dev`
- Ref: `otusjahkdjpxqayeeqqn`
- URL: `https://otusjahkdjpxqayeeqqn.supabase.co`

## 3. Region

`ap-southeast-1` (Singapore) — confirmed matches the approved target.

## 4. PostgreSQL version

`17.6.1.147` (engine 17, `ga` release channel).

## 5. Migration list and status

Pre-deployment state (Phase 0): 0 tables, 0 migrations, 0 auth users, 0 storage buckets, 0 edge functions, 12 schemas (all Supabase defaults), only baseline extensions installed (`plpgsql`, `uuid-ossp`, `pgcrypto`, `pg_stat_statements`, `supabase_vault`).

| # | File | Status |
|---|---|---|
| 1 | `0001_extensions_and_helpers.sql` | ✅ applied |
| 2 | `0002_shared_enums.sql` | ✅ applied |
| 3 | `0003_master_data_core.sql` | ✅ applied |
| 4 | `0004_organization.sql` | ✅ applied |
| 5 | `0005_identity_and_rbac.sql` | ✅ applied |
| 6 | `0006_settings.sql` | ✅ applied |
| 7 | `0007_master_data_extended.sql` | ✅ applied |
| 8 | `0008_media.sql` | ✅ applied |
| 9 | `0009_cms.sql` | ✅ applied |
| 10 | `0010_navigation.sql` | ✅ applied |
| 11 | `0011_forms.sql` | ✅ applied |
| 12 | `0012_seo.sql` | ✅ applied |
| 13 | `0013_audit.sql` | ✅ applied |
| — | `policies/0001_helper_functions.sql` | ✅ applied |
| — | `policies/0002_public_content_policies.sql` | ✅ applied |
| — | `policies/0003_internal_tables_policies.sql` | ✅ applied |
| — | `0014_security_hardening_search_path_and_extension_schema` *(new, this pass)* | ✅ applied |
| — | `0015_performance_hardening_wrap_auth_uid_in_rls` *(new, this pass)* | ✅ applied |

Zero failures across all 16 approved-architecture files, applied one at a time in dependency order. Two small hardening migrations were added post-deploy (not part of the original approved 13+3) — see §16 for full rationale; neither changes a table, column, or RLS policy's access semantics.

## 6. Final actual table count

**47** (`public` schema, `information_schema.tables`) — exact match to the approved architecture (`docs/backend/sprint-1a2-reduction-report.md`).

## 7. Final RLS-enabled table count

**47 / 47** — every table has RLS enabled, exact match to table count.

## 8. Final policy count

**98** policies across the 47 tables. Other object counts, verified programmatically (not asserted): 96 foreign keys, 127 indexes, 38 distinct triggers, 5 application-defined functions (the rest of `pg_proc` in `public` — 45 entries — are `citext` extension operators, now relocated to the `extensions` schema per §16).

## 9. Seed summary

All 5 seed files applied in order, zero errors. Verified row counts (all exact matches to expected seed content):

| Table | Rows | | Table | Rows |
|---|---|---|---|---|
| languages | 5 | | roles | 8 |
| currencies | 2 | | permissions | 25 |
| countries | 1 | | role_permissions | 91 |
| provinces | 3 | | setting_definitions | 9 |
| destinations | 6 | | setting_values | 4 |
| destination_translations | 12 | | cms_block_definitions | 20 |
| product_types | 17 | | cms_pages | 1 |
| customer_types | 4 | | seo_metadata | 1 |
| organizations | 1 | | cms_page_versions | 1 |
| brands | 1 | | cms_sections | 1 |
| websites | 2 | | cms_blocks | 1 |
| offices | 1 | | navigation_menus | 1 |
| business_units | 5 | | navigation_items | 2 |
| departments | 4 | | forms | 1 |

Relationship spot-checks: `minhviettravel.com` is `ACTIVE`/`MAIN_SITE`; `vemaybay.minhviettravel.com` is `PLANNED`/`SERVICE_APP` (both per spec); the seeded homepage `cms_page` has a `PUBLISHED`, `is_current = true` version with `published_at` set. `role_permissions` count (91) reconciles exactly to the per-role grant lists in the seed file (SUPER_ADMIN 25 + ADMIN 25 + MANAGER 17 + SALES 3 + BOOKING 2 + OPERATION 3 + MARKETING 13 + VIEWER 3 = 91).

Seed idempotency verified live: re-ran `0001_core_master_data.sql` in full against the already-seeded database — zero errors, every table's row count identical before and after.

## 10. Auth user summary

**1** real `auth.users` row: the approved administrator, invited via the Supabase dashboard by the owner (email confirmed at intake). Linked to `user_profiles` (`account_status = ACTIVE`), `user_organization_memberships` (Minh Việt Travel, `ACTIVE`), and `user_roles` (`SUPER_ADMIN`) — exactly one admin-role assignment exists, confirmed via direct count. No password, invite token, or other credential material was ever generated, printed, or stored outside Supabase Auth itself.

A second, throwaway auth user was created and deleted during Phase 6 RLS testing (see §11) — zero auth users beyond the one real admin remain post-cleanup, confirmed by direct count.

## 11. RLS test matrix

Method: Postgres role + JWT-claim spoofing (`SET LOCAL ROLE <role>; SELECT set_config('request.jwt.claims', ...)`), the standard way to exercise Supabase RLS from SQL, run directly against the live database inside transactions that were never committed (mutation attempts) so no test data persists. One real, throwaway `auth.users` row was created for the one scenario that requires a genuine FK-chained identity (org member with a non-admin role), then deleted — confirmed via row-count queries before/after that the database returned to exactly its pre-test state.

Two methodology pitfalls were caught and corrected before trusting any result: (1) `INSERT ... SELECT ... FROM <RLS-protected table>` can silently insert zero rows when the source `SELECT` itself is RLS-filtered to empty — this looks like "no exception raised" but isn't a bypass; (2) an `UPDATE` matching zero RLS-visible rows likewise raises no exception. Every mutation test below was re-verified using literal values and `GET DIAGNOSTICS row_count` rather than trusting the absence of an exception alone.

| Scenario | Test | Result |
|---|---|---|
| **1. Anonymous** | Self-elevate to SUPER_ADMIN via `user_roles` insert | DENIED |
| | Direct insert into `form_submissions` | DENIED |
| | Edit published CMS page version | DENIED (0 rows matched) |
| | `websites` visible | 1 (only `ACTIVE`) |
| | `cms_pages` visible | 1 (only published) |
| | `user_profiles` / `roles` / `permissions` / `audit_logs` / `security_events` / `organizations` / `user_organization_memberships` visible | 0 each |
| | `setting_values` visible | 3 (`PUBLIC` visibility only, of 4 total) |
| | `forms` catalog visible | 1 (`ACTIVE`) |
| | `media_assets` visible | 0 (none seeded `PUBLIC`) |
| **2. Authenticated, no org membership** | `organizations`/`brands` visible | 0 each |
| | `roles`/`permissions` catalog visible | 8 / 25 (intentional — catalog isn't secret, see `rls-policy-matrix.md`) |
| | `websites` visible | 1 (public policy only, no staff grant) |
| | `auth_has_permission('user.manage')` | false |
| | Edit organization | DENIED (0 rows changed) |
| | Self-add org membership | DENIED |
| **3. Org member, VIEWER role (no admin permission)** | `organizations` visible | 1 (is member) |
| | `cms_pages` visible | 1 (has `cms.page.read`) |
| | `audit_logs` visible | 0 (no `audit.read`) |
| | Edit CMS page | DENIED (0 rows changed — no `cms.page.update`) |
| | Grant self `role.manage` permission | DENIED |
| | Touch `role_permissions` | DENIED (0 rows changed) |
| | Edit `audit_logs` | DENIED (0 rows changed) |
| | Own profile visible / other profiles visible | 1 / 0 |
| **4. Authorized administrator (SUPER_ADMIN)** | `auth_has_permission('role.manage')` | true |
| | `organizations` visible | 1 |
| | `user_profiles` visible (all) | 2 (admin + test fixture, at time of test) |
| | `setting_values` visible (incl. `INTERNAL`) | 4 (all) |
| | Edit CMS page | ALLOWED (1 row changed) |
| | Direct `INSERT` into `audit_logs` as `authenticated` role | DENIED (no INSERT policy exists for `authenticated` at any permission level — audit writes are service-role-only by design, confirmed even for SUPER_ADMIN) |
| **5. Service role (server-side only)** | Sees all organizations / all profiles (bypasses RLS) | 1 / 2 |
| | Insert audit log | ALLOWED (expected — this is the intended write path) |
| | **Update** that same audit log row | DENIED — `forbid_mutation` trigger fires even for `service_role` (defense-in-depth beyond RLS) |
| | **Delete** that same audit log row | DENIED — same trigger |

Additional structural verification (`pg_roles`): `service_role` has `rolbypassrls = true` (as designed); `anon` and `authenticated` both have `rolbypassrls = false` and are not members of each other or of any privileged role.

Checklist items with limited empirical coverage in this pass, noted rather than silently skipped: cross-website and cross-organization data leakage are structurally prevented by policy design (every scoped policy filters through `auth_user_organization_ids()`/`auth_user_website_ids()`, never a bare boolean), but the current seed data has only one organization and only one website with content, so an empirical two-tenant leak test wasn't possible without inventing out-of-scope data. Revisit empirically once a second organization or website goes live.

`service-role key is not used by frontend code`: verified structurally (not just asserted) — `shared/supabase/server-client.ts` is `import 'server-only'`, and a repo-wide grep found zero `NEXT_PUBLIC_`-prefixed reference to `SUPABASE_SERVICE_ROLE_KEY`.

## 12. Integrity test results

All run live against `mv-travel-os-dev`, inside rolled-back transactions (constraint tests) or real insert→verify→delete cycles (trigger timing tests, which need genuine elapsed time across separate transactions since Postgres's `now()` is frozen for the lifetime of one transaction):

| Test | Result |
|---|---|
| Duplicate active website domain, case-insensitive (`MINHVIETTRAVEL.COM` vs seeded `minhviettravel.com`) | DENIED (`unique_violation`) |
| Domain reusable after soft-delete (insert → soft-delete → re-insert same domain, case-varied) | ALLOWED (by design) |
| Duplicate CMS slug, same website + locale (`HOME` vs seeded `home`, case-insensitive) | DENIED |
| Same slug, different locale (`home` in `en` vs `vi`) | ALLOWED (correctly scoped per locale) |
| Duplicate `canonical_url` on the same website | DENIED |
| Duplicate `form_submissions.idempotency_key` | DENIED |
| `updated_at` trigger fires on UPDATE | Confirmed via real insert → update → compare across separate transactions: `updated_at` (10:17:36) > `created_at` (10:17:33) |
| `created_at`/`updated_at` are timezone-aware | Confirmed — 0 non-`timestamptz` `created_at`/`updated_at` columns found across all 47 tables |
| Seed re-run idempotency | Confirmed — `0001_core_master_data.sql` re-applied in full, zero errors, identical row counts before/after |
| Deferred modules absent | Confirmed (Phase 2/3 static + live table list) |
| No unused future-integration tables deployed | Confirmed — live table count is exactly 47, matching the approved list with zero extras |

Every test record created for verification (a throwaway website, CMS page, SEO row, form submission, FAQ category, and the one throwaway auth user) was deleted immediately after use. Zero seed records were touched or removed — confirmed via post-cleanup row counts matching §9 exactly.

## 13. Environment variables required

Documented in `.env.example` and `docs/infrastructure/supabase-environment.md`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, `DEFAULT_ORGANIZATION_ID`, `DEFAULT_BRAND_ID`, `DEFAULT_WEBSITE_ID`, `APP_URL`, `ADMIN_APP_URL`, `LOG_LEVEL`. `.env.local` (git-ignored, confirmed) holds the real project URL and anon key (both public-safe by design); the service-role key and database connection string were left blank because no tool in this session can retrieve them — the owner must copy them from the Supabase dashboard directly into `.env.local`.

## 14. Security risks remaining

- **Manual secrets not yet filled**: `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DATABASE_URL` in `.env.local` are blank pending manual entry (see §15).
- **`shared/supabase/server-client.ts#getServerSupabaseClient()` and `shared/auth/session.ts#resolveActor()` remain unimplemented placeholders** — the 3 existing API routes still throw `INTERNAL_ERROR` if invoked. Wiring these up is explicitly Sprint 1B.2 scope, not this pass.
- **Single-tenant test coverage**: cross-organization and cross-website RLS leakage is structurally prevented by design but not yet empirically exercised with a second real tenant (see §11).
- **Rate limiting, CSRF, secure cookies, CORS, file-upload validation, signed URLs, security headers**: still extension points only, as tracked in `docs/security/security-checklist.md` — none is meaningfully testable without a live deployed frontend talking to this database, which is Sprint 1B.2+ scope.
- **`role_scopes` remains unenforced** (documented, accepted limitation for single-website V1 — `auth_has_permission()` is scope-blind until a second website/brand makes scoping meaningful).

No finding in this list is a regression introduced by this deployment — all were already flagged as forward-looking risk in the Sprint 1A.2 report and are restated here for completeness.

## 15. Manual configuration still required

1. Copy the `service_role` key and the database connection string from the Supabase dashboard (Project Settings → API / Database) into `.env.local` — not retrievable by any tool available in this session, and deliberately never printed here.
2. When staging is provisioned, repeat Phase 0–4 against a separate Supabase project per environment (master-prompt §5).

## 16. Divergence from the approved architecture

None at the schema/table/column level — the deployed database is byte-for-byte the approved 13 migrations + 3 policy files, verified both statically (Phase 2) and against live object counts (Phase 3: 47/47/96/127/38/98, all exact matches).

Two small, non-architectural hardening migrations were added after live deployment, surfaced by Supabase's own security/performance advisor (not part of the original approved file set, so flagged explicitly rather than silently folded in):

- **`0014`**: `set_updated_at()`/`forbid_mutation()` lacked a fixed `search_path` (the 3 RLS helper functions already had one) — closed for consistency. The `citext` extension had installed into `public` (the original migration didn't specify a target schema) — moved to `extensions`, matching where `pgcrypto`/`uuid-ossp` already live.
- **`0015`**: 7 RLS policies compared `column = auth.uid()` directly, which Postgres re-evaluates per row instead of once per query. Rewritten as `column = (select auth.uid())` — Supabase's documented fix, semantics-preserving (verified via the full RLS test matrix in §11, run after this change).

Both are additive, non-breaking, and don't touch table/column shape, RLS policy *logic*, or seed data. The remaining advisor findings (47 unindexed-FK INFOs, 44 unused-index INFOs — expected on a zero-traffic dev database — and 44 multiple-permissive-policies WARNs, an intentional architectural pattern of separate public/staff read policies per table) were reviewed and left as-is; none indicates a defect.

## 17. Recommendation for Sprint 1B.2

Proceed as planned: implement `getServerSupabaseClient()` and `resolveActor()` for real against this now-live project, then build out the service/repository layers for the 7 remaining schema-only modules (`settings`, `master-data`, `media`, `cms`, `forms`, `seo`, `audit`), following the `organization`/`access-control` reference pattern already in the repo. No changes to this pass's scope are needed first.

---

## Definition of Done — checklist

- [x] Correct Supabase account authenticated (dev@minhviettravel.com, after an initial wrong-account stop-and-correct)
- [x] Correct organization confirmed (Minh Viet Travel)
- [x] `mv-travel-os-dev` healthy, region `ap-southeast-1`
- [x] Environment variables configured safely (`.env.local` git-ignored, no secret printed)
- [x] All approved migrations execute successfully (13/13 + 3/3 policy files, zero failures)
- [x] Actual schema matches migrations and ERD (47 = 47, exact)
- [x] All approved seeds execute successfully (5/5, zero errors, idempotent on re-run)
- [x] RLS enabled on every required table (47/47)
- [x] RLS behavior verified using 5 distinct authorization scenarios, live
- [x] No unauthorized privilege escalation possible in any tested flow
- [x] No deferred table deployed
- [x] No secret committed or printed
- [x] TypeScript passes (`pnpm exec tsc --noEmit`, 0 errors)
- [x] Lint passes (`pnpm lint`, 0 warnings/errors)
- [x] Tests: no test runner configured in this repo (`package.json` has no `vitest`/`jest`/test script); one pre-existing test file (`lib/tours/availability.test.ts`) has no runner to execute it — explicitly documented, not silently skipped, matching the same finding already on record from Sprint 1A
- [x] Production build passes (`pnpm build` — 25 static routes + 3 dynamic API routes, no regressions)
- [x] Documentation matches the live development database

**Sprint 1B.1 is complete. Per the stop condition in scope, no work has begun on Tour, Flight, Hotel, Cruise, Attraction Ticket, Booking, CRM, Payment, Marketing, AI Import, Notifications, Integration Registry, Sprint 2, or any frontend change. Awaiting owner approval before Sprint 1B.2.**
