# Playbook: Manage a Redirect Rule

## Create

```
POST /api/v1/seo/redirects
{ "websiteId": "<uuid>", "sourcePath": "/old-page", "destinationUrl": "/new-page", "redirectKind": "301" }
```

Requires `seo.redirect.update`. `sourcePath` must start with `/`; `redirectKind` is `301` (default) or `302`.

## Update / delete

```
PATCH /api/v1/seo/redirects/{id}
DELETE /api/v1/seo/redirects/{id}
```

## What's validated before the write

- **Self-redirect**: `destinationUrl === sourcePath` is rejected outright (`VALIDATION_ERROR`).
- **Loop detection**: `SeoService` walks the destination chain — if the new/updated rule's `destinationUrl` matches another rule's `sourcePath` on the same website, it follows that rule's own `destinationUrl`, and so on (bounded to 20 hops), rejecting if the chain ever leads back to the original `sourcePath`. This catches multi-hop loops (`/a -> /b -> /c -> /a`), not just direct two-rule cycles. An external destination (one that never matches an existing `sourcePath`) simply ends the walk — it's not itself validated as reachable.
- **Duplicate source path**: creating a second rule for the same `sourcePath` on the same website returns `409 CONFLICT` (the DB has no unique constraint doing this for you beyond `(website_id, locale, source_path)`, which allows the same path across different locales intentionally — this check is `sourcePath`-only, matching the common case).

All three are unit-tested (`modules/seo/application/seo.service.test.ts`) against an in-memory fake, independent of live data.

## Slug changes and redirect rules are separate concerns

Changing a CMS page's slug via `PUT /api/v1/seo/metadata/{entityType}/{entityId}` automatically writes a `slug_history` row (old locale + slug) — but does **not** automatically create a redirect. If the old URL should 301 to the new one, create that `redirect_rules` row explicitly via this playbook; `slug_history` exists so that decision can be made deliberately (e.g. by a future automated job cross-referencing it), not to silently redirect every slug change.
