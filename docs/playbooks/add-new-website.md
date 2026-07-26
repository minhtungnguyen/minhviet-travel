# Playbook: Add a New Website

Adding a website (e.g. activating `mivigo.vn`) is a **data operation**, not a schema change — this is the whole point of the multi-site-capable schema (`docs/architecture/multi-site-architecture.md`).

1. Ensure a `brands` row exists for the owning brand (create one first if this is a genuinely new brand — see `add-new-brand.md`).
2. Insert into `websites`: `brand_id`, `domain` (must be unique among non-deleted websites, case-insensitively — `websites_domain_active_unique`), `name`, `website_type`, `default_locale`, `default_currency_code`, `status = 'PLANNED'` initially.
3. Seed its navigation (`navigation_menus`/`navigation_items` for `HEADER`/`FOOTER`), at least one `cms_pages` row (`page_type = 'HOME'`) with a published `cms_page_versions`, and `seo_metadata` for that page — copy the pattern in `database/seeds/0005_cms_navigation_forms_seo.sql`.
4. Add any website-specific `forms` catalog rows it needs (contact form at minimum) — see `configure-form.md`.
5. Grant staff access via `user_website_access` for whoever will manage it.
6. Flip `websites.status` to `'ACTIVE'` once content is ready — this is what makes it visible to `anon` under `docs/database/rls-policy-matrix.md`'s public-content policies.
7. Update `docs/architecture/multi-site-architecture.md`'s seeded-website list to keep the doc honest.

No RLS policy, no migration, no application code change is required for this — every public-content policy filters on `status`/`deleted_at` of the row itself, not on a hardcoded website id.
