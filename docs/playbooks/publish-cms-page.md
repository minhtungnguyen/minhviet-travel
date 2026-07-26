# Playbook: Publish a CMS Page

Lifecycle: `DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED` (or `SCHEDULED` for a future date), with `ARCHIVED` reachable from any non-terminal state. Enforced as a real state machine in `CmsService` (`modules/cms/application/cms.service.ts`) — an out-of-order call (e.g. publishing straight from `DRAFT`) returns `409 CONFLICT`, not a silent no-op.

See `docs/playbooks/create-cms-page.md` first for how a page and its first `DRAFT` version get created.

## The four transition calls

All four operate on a page's **most recent version** implicitly — you never pass a version id to these:

```
POST /api/v1/cms/pages/{pageId}/submit-review   # DRAFT -> IN_REVIEW, requires cms.page.update
POST /api/v1/cms/pages/{pageId}/approve          # IN_REVIEW -> APPROVED, requires cms.page.update
POST /api/v1/cms/pages/{pageId}/publish          # APPROVED -> PUBLISHED (or SCHEDULED), requires cms.page.publish
POST /api/v1/cms/pages/{pageId}/archive          # any non-terminal state -> ARCHIVED, requires cms.page.update
```

`cms.page.publish` is a separate permission from `cms.page.update` — a `MANAGER`/`MARKETING` role holds both by default (`database/seeds/0003_rbac.sql`), but a narrower custom role could hold one without the other, e.g. an editor who can prepare content but not push it live.

## Publish immediately vs. schedule

```
POST /api/v1/cms/pages/{pageId}/publish
{}
```
publishes immediately: sets `status = PUBLISHED`, `is_current = true`, `published_at = now()`.

```
POST /api/v1/cms/pages/{pageId}/publish
{ "scheduledPublishAt": "2026-08-01T00:00:00.000Z" }
```
with a future timestamp sets `status = SCHEDULED` instead and does **not** flip `is_current` — nothing is live yet. **No background scheduler exists** (explicitly out of scope, spec §12: "no scheduler is required yet") — when the scheduled time arrives, a second, separate `POST .../publish` call (with no `scheduledPublishAt`, or one that has already passed) is what actually makes it live. Automating that second call on a timer is orchestration logic outside this API, not a gap in it.

## What "publishing" actually flips

`is_current` is a partial-unique-indexed pointer (`cms_page_versions_current_idx`, at most one `true` per page). `CmsService` unsets the old current version, then sets the new one — two sequential updates, not a single database transaction (no RPC was added this sprint to keep the schema unchanged), so there's a brief window with zero current versions rather than ever risking two. Public reads (`GET /api/v1/public/sites/{websiteKey}/pages/{slug}`) require both `is_current = true` AND `status = 'PUBLISHED'` — an `APPROVED`-but-not-yet-published version, or an old version that just got unset, is never publicly visible.

## Public visibility follows automatically

No separate "make public" step exists — the moment a version satisfies `is_current AND status = 'PUBLISHED'`, `docs/database/rls-policy-matrix.md`'s `public_read_pages_with_published_version`/`public_read_published_versions` policies expose it, and `GET /api/v1/public/sites/{websiteKey}/pages/{slug}?locale=` returns it (with a redundant application-layer check for the same condition, defense in depth per `docs/security/authorization-flow.md`).
