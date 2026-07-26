# Multi-Site / Multi-Brand Architecture

## Model

```
organizations (1 seeded: Minh Việt Travel)
  └─ brands (1 seeded: Minh Việt Travel)
       └─ websites (2 seeded: minhviettravel.com ACTIVE, vemaybay.minhviettravel.com PLANNED)
```

A website belongs to exactly one brand (`websites.brand_id`); a brand belongs to exactly one organization (`brands.organization_id`). Nothing stores `organization_id` redundantly on `websites` — it's reachable via `brands.organization_id`, per master-prompt §10's "use normalized ownership relationships" instead of stamping every id on every table.

## Website status lifecycle

`website_status`: `PLANNED` → `ACTIVE` → (`INACTIVE` | `ARCHIVED`). A `PLANNED` website record exists (so it can be referenced, e.g. in navigation planning) but is invisible to `anon` — the RLS policy `public_read_active_websites` only matches `status = 'ACTIVE'`.

## What is website-scoped vs. organization-scoped

Website-scoped (each row belongs to exactly one website): `cms_pages`, `navigation_menus`, `forms`, `form_submissions`, `seo_metadata`, `redirect_rules`, `slug_history`, `faq_categories`, `faqs`, `announcements`, `media_folders`/`media_assets` (optionally — nullable, can also be organization-wide).

Organization-scoped (shared across every website the organization owns): `organizations`, `business_units`, `offices`, `departments`, `positions`, `roles`/`permissions` (global, not even organization-scoped), master data lookups (`countries`, `currencies`, `destinations`, ...).

Brand-scoped: `brands` itself. (A dedicated brand-membership table, `user_brand_memberships`, was removed in Sprint 1A.2 — with exactly one brand in V1 it could never produce a different access outcome than organization membership; see `docs/backend/sprint-1a2-reduction-report.md` §3. Brand-level access control returns if/when a second brand is actually seeded.)

## Adding a new website

Per `docs/playbooks/add-new-website.md` — this is a **data operation**, not a schema change: insert a `websites` row under an existing (or new) `brand_id`, seed its `cms_pages`/`navigation_menus`/`forms` the same way `database/seeds/0005_cms_navigation_forms_seo.sql` does for `minhviettravel.com`. `mivigo.vn`, `vevuichoi.vn`, `minhvietbooking.com`, `checkincatba.com` (named in the master prompt §3.2 as future properties) are not seeded in Sprint 1A precisely so this claim is testable later without a migration.

## RLS enforcement

Every website-scoped public table's RLS policy filters on the row's own `status`/`deleted_at`, not on `website_id` matching some hardcoded value — a second website appearing tomorrow does not require touching any policy in `database/policies/`. See `docs/database/rls-policy-matrix.md`.

## The flight app (`vemaybay.minhviettravel.com`)

Master-prompt §3.3 describes a different UX (search-and-transaction) for this site while requiring it to share identity, CRM, booking foundation, analytics, and audit infrastructure with the main site. In Sprint 1A this is only a `websites` row with `website_type = 'SERVICE_APP'` and `status = 'PLANNED'` — no flight-specific tables exist yet (those arrive with the Sprint 2+ Flight domain per `docs/architecture/future-travel-domains.md`, on top of `integrations/flight/contracts/flight-provider.ts`).
