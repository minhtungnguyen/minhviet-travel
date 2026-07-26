# Playbook: Add a New Role

Sprint 1 ships Volume 00's fixed 8 roles (`sprint-1-implementation-plan.md` §1.2). The RBAC schema supports more without a migration:

1. Insert into `roles`: `key` (unique, e.g. `'CONTENT_EDITOR'`), `name`, `description`, `is_system = false` (system roles like `SUPER_ADMIN` should never be deleted; a custom role can be).
2. Grant it permissions: insert `role_permissions` rows for each `permissions.key` it should hold — see `database/seeds/0003_rbac.sql` for the existing 8 roles' mappings as a reference for how granular to be.
3. Assign it to a user: insert `user_roles` (user_profile_id, role_id), then optionally `role_scopes` rows if the grant should be limited to one organization/brand/website/business-unit rather than being organization-wide.
4. No code change is required — `requirePermission()` (`shared/auth/session.ts`) and every RLS policy (`database/policies/`) check permission **keys**, never role keys directly. A new role is invisible to application code until it's granted permissions; from then on it behaves exactly like the seeded 8.

## Adding a new permission (rarer)

If the new role needs a capability nothing currently checks for (e.g. a hypothetical `cms.page.translate`), add a row to `permissions` first, then reference its key from both `requirePermission()` call sites you want it to gate AND the corresponding RLS policy in `database/policies/` — the two must be added together, since master-prompt §17 requires both layers, not one or the other.
