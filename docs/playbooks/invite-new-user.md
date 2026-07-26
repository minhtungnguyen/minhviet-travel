# Playbook: Invite a New User

There is no `POST /api/v1/users` — user provisioning is deliberately routed through Supabase Auth's own invite flow, never through this API, so no application code path can mint a session for an identity nobody approved (the same reasoning documented in Sprint 1B.1's admin-creation step).

## Steps

1. **Invite via the Supabase dashboard**: `mv-travel-os-dev` → Authentication → Users → Invite user, with the intended email. This creates the `auth.users` row and sends the invite email; Supabase Auth is the only password/session authority (master-prompt §8.2 — no custom password table exists anywhere in this schema).
2. **Look up the new user's id**: `GET /api/v1/users?search=<name or partial match>` (requires `user.manage`) — or query `auth.users` directly if you have dashboard access. The invited user won't appear in `GET /api/v1/users` until step 3, since that endpoint reads `user_profiles`, not `auth.users` directly.

   Actually — `user_profiles` has no `INSERT` trigger from `auth.users` in this schema (no automatic profile-provisioning function exists). Until the new user's first sign-in completes and something inserts their `user_profiles` row, `PATCH /api/v1/users/{id}` and `POST /api/v1/users/{id}/roles` will 404. Practically: have the invited user complete sign-in first, or provision `user_profiles` directly via SQL as part of onboarding (matching exactly what Sprint 1B.1 Phase 5 did for the first SUPER_ADMIN) before assigning roles/membership through the API.
3. **Link the profile** (if not already provisioned): `user_profiles` row keyed by the `auth.users.id`, `user_organization_memberships` row for the target organization, both `ACTIVE`.
4. **Assign a role**: see `docs/playbooks/assign-user-role.md`.
5. **Grant website access** if the user needs a narrower scope than "every website in the organization" (the default once they have an active membership): see `docs/playbooks/grant-website-access.md`.

## What this API layer does cover

Once `user_profiles`/`user_organization_memberships` exist, everything else is ordinary API calls: `PATCH /api/v1/users/{id}` (admin fields incl. `accountStatus`), `PATCH /api/v1/users/{id}/profile` (self-service fields), `PATCH /api/v1/users/{id}/membership` (department/position/office/manager via `employee_profiles`).
