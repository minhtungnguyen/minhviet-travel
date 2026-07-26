# Playbook: Add a New Brand

1. Confirm the owning `organizations` row exists (Sprint 1 seeds exactly one — Minh Việt Travel).
2. Insert into `brands`: `organization_id`, `name`, `slug` (unique), `display_name`, optionally `logo_media_id` (upload the logo through the Media module first if so).
3. Grant relevant staff access via `user_website_access` on the new brand's website(s) once created (step 4) — there is no separate brand-membership table in Sprint 1B; it was removed as redundant with organization membership while only one brand existed (`docs/backend/sprint-1a2-reduction-report.md` §3). If brand-level access genuinely needs to differ from organization-wide access once a second brand exists, that table returns then.
4. Create at least one `websites` row under the new brand (see `add-new-website.md`).
5. If the brand needs its own settings overrides (contact info, social links), add `setting_values` rows scoped `BRAND` with `scope_resource_id = <brand id>` — see `docs/database/data-dictionary.md`'s Settings section for how scope resolution works.

No schema change. `brands.organization_id` is the only required linkage; everything else (websites, memberships, settings overrides) attaches after the fact.
