# Playbook: Create a CMS Page

Superseded by the real `modules/cms` API as of Sprint 1B.2 — this playbook previously described raw SQL `INSERT`s (Sprint 1A, before any application layer existed). Use the API now; the SQL underneath is exactly what's described in `docs/database/data-dictionary.md` if you need the schema-level detail.

## Create the page

```
POST /api/v1/cms/pages
{ "websiteId": "<uuid>", "locale": "vi", "pageType": "STATIC_PAGE", "slug": "ve-chung-toi" }
```

Requires `cms.page.create`. Slug uniqueness is checked at the service layer before insert (`website_id, locale, slug` — case-insensitive) and enforced again by the DB's own partial unique index either way.

## Create its first version, with content

```
POST /api/v1/cms/pages/{pageId}/versions
{
  "title": "Về chúng tôi",
  "sections": [
    {
      "sectionKey": "hero",
      "position": 1,
      "blocks": [
        { "blockDefinitionKey": "HERO", "position": 1, "config": { "headline": "..." } }
      ]
    }
  ]
}
```

Requires `cms.page.update`. This creates the version (`status = DRAFT`, `version_number` auto-incremented, `is_current = false`) and its whole section/block tree in one call — `blockDefinitionKey` must match one of the 20 seeded rows in `cms_block_definitions` (`GET /api/v1/cms/block-definitions` to list them); `config` is validated as a JSON object here, not against each block's own schema (that per-block Zod validation is deferred to whichever renders it — see `modules/cms/domain/types.ts`'s note on `configSchema`).

You can also build the tree incrementally instead of in one call: `POST /api/v1/cms/pages/{pageId}/sections`, then `POST /api/v1/cms/sections/{sectionId}/blocks` per block — useful for an editor UI adding one block at a time, or a bulk content generator preferring smaller, independently-retriable calls over one large payload. Both paths produce identical rows; neither is a "human" or "AI" path — same validation, same permission check, same audit entry either way.

## Attach SEO metadata

```
PUT /api/v1/seo/metadata/cms_page/{pageId}
{ "websiteId": "<uuid>", "locale": "vi", "title": "...", "slug": "ve-chung-toi", "canonicalUrl": "https://minhviettravel.com/ve-chung-toi" }
```

Requires `seo.metadata.update`. See `docs/database/data-dictionary.md` for why `seo_metadata` is a separate, polymorphic `(entity_type, entity_id)` table rather than columns on `cms_pages` itself.

## Draft → review → publish

See `docs/playbooks/publish-cms-page.md` for the full lifecycle (`submit-review` → `approve` → `publish`/`schedule` → `archive`). A later edit creates version 2 as a new row (`POST .../versions` again) rather than mutating the published version in place — this is what makes `cms_page_versions` a real version history.
