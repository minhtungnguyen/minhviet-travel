# Playbook: Grant or Revoke Website Access

By default, any user with an ACTIVE `user_organization_memberships` row has access to **every website under every brand of that organization** — this is `requireWebsiteAccess()`'s "organization-wide" branch, mirroring `auth_user_website_ids()` at the RLS layer exactly. You only need this playbook for a **narrower** grant: a user (e.g. a future contractor) who should see just one site, not the whole organization.

`user_website_access` grants are additive on top of organization-wide access, never a restriction of it — there is no "deny" mechanism in this schema. If a user is a full organization member, granting or revoking `user_website_access` for them has no visible effect; it only matters for someone who is *not* an organization member but should still reach one specific website (not a supported combination today, since `resolveActor()` requires organization membership to populate a non-null `organizationId` — revisit if that scenario becomes real).

## Grant

```
POST /api/v1/users/{userId}/website-access
{ "websiteId": "<website uuid>" }
```

Requires `user.manage`.

## Revoke

```
DELETE /api/v1/users/{userId}/website-access/{websiteId}
```

Requires `user.manage`.

## Where this is actually checked

Every CMS/navigation/FAQ/SEO/forms/media mutation calls `requireWebsiteAccess(actor, { id: websiteId, organizationId })` — see `docs/security/authorization-flow.md`. This is real, live-enforced access control today, not a placeholder for a future check: with the current single-organization, single-active-website deployment, it's a near-always-pass check for any org member, but it activates correctly the moment a second website or a narrower-scoped user exists — no service-layer change required.
