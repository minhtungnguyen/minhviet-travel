# Playbook: Assign or Revoke a User Role

## Assign

```
POST /api/v1/users/{userId}/roles
{ "roleId": "<role uuid>", "scopes": [] }
```

Requires `user.manage`. `scopes` is accepted (`role_scopes` schema exists) but unenforced anywhere — `role_scopes` remains schema-only per the approved Sprint 1A.2 decision, revisited once a second website/brand makes scoping meaningful. Pass `[]` unless you have a specific reason not to.

Look up `roleId` via `GET /api/v1/roles` first — the 8 fixed role keys (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `BOOKING`, `OPERATION`, `MARKETING`, `VIEWER`) are seeded once and never created through this API.

## Revoke

```
DELETE /api/v1/users/{userId}/roles/{roleId}
```

Requires `user.manage`.

## Protections enforced server-side (not just documented)

- **Self-elevation is impossible**: if `userId` equals the *caller's own* id, both endpoints return `403 FORBIDDEN` unconditionally — an admin cannot grant or revoke their own role, full stop, regardless of what permission they hold. Use a second admin account to change your own roles.
- **The last `SUPER_ADMIN` cannot be revoked**: `DELETE .../roles/{superAdminRoleId}` returns `409 CONFLICT` if the target is the only user currently holding `SUPER_ADMIN`. Assign `SUPER_ADMIN` to a second user first if you need to remove it from the first.

Both are unit-tested against an in-memory fake repository (`modules/access-control/application/access-control.service.test.ts`), independent of any live data.
