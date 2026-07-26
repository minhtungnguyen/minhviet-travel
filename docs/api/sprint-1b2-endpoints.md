# Sprint 1B.2 Endpoint Surface

79 routes, all real files under `app/api/v1/`, all following `docs/api/api-conventions.md` exactly (same envelope, same `requirePermission`/`requireWebsiteAccess` pattern). Every route listed here exists — this document does not describe anything aspirational. Endpoints marked **public** live under `/api/v1/public/sites/{websiteKey}/...` and never call `resolveActor()`.

## Auth (`shared/auth`, wraps Supabase Auth directly)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/auth/session` | Never throws for "not logged in" — returns `{authenticated: false}` |
| GET | `/api/v1/auth/me` | Throws `UNAUTHENTICATED` if no session |
| POST | `/api/v1/auth/logout` | |
| POST | `/api/v1/auth/password-reset` | Public — always returns success regardless of whether the email exists |
| POST | `/api/v1/auth/password-update` | Requires an authenticated (incl. recovery) session |

## Organization (`modules/organization`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/organizations` |
| GET, PATCH | `/api/v1/organizations/{id}` |
| GET, POST | `/api/v1/brands` |
| GET, PATCH, DELETE | `/api/v1/brands/{id}` (DELETE = archive, no `deleted_at` column) |
| GET, POST | `/api/v1/websites` |
| GET, PATCH, DELETE | `/api/v1/websites/{id}` (DELETE = real soft-delete, `websites.deleted_at`) |
| GET, POST | `/api/v1/business-units` |
| PATCH, DELETE | `/api/v1/business-units/{id}` (DELETE = archive) |
| GET, POST | `/api/v1/offices` |
| PATCH, DELETE | `/api/v1/offices/{id}` (DELETE = archive) |
| GET, POST | `/api/v1/departments` |
| PATCH, DELETE | `/api/v1/departments/{id}` (DELETE = archive) |
| GET, POST | `/api/v1/positions` |
| PATCH, DELETE | `/api/v1/positions/{id}` (DELETE = archive) |

## Users & RBAC (`modules/access-control`)

| Method | Path |
|---|---|
| GET | `/api/v1/roles` |
| GET | `/api/v1/permissions` |
| GET | `/api/v1/users` |
| GET, PATCH | `/api/v1/users/{id}` (PATCH admin-only, accepts `accountStatus`) |
| GET, PATCH | `/api/v1/users/{id}/profile` (self-or-admin, no `accountStatus`) |
| GET, PATCH | `/api/v1/users/{id}/membership` (employee profile: department/position/office/manager) |
| GET, POST | `/api/v1/users/{id}/roles` |
| DELETE | `/api/v1/users/{id}/roles/{roleId}` |
| GET, POST | `/api/v1/users/{id}/website-access` |
| DELETE | `/api/v1/users/{id}/website-access/{websiteId}` |

No `POST /api/v1/users` — accounts are provisioned exclusively via the Supabase Auth dashboard invite flow (`docs/playbooks/invite-new-user.md`), never through this API.

## Settings (`modules/settings`)

| Method | Path |
|---|---|
| GET | `/api/v1/settings` (definition catalog) |
| GET | `/api/v1/settings/resolved?websiteId=` (resolves every definition for the actor's context) |
| GET, PUT, DELETE | `/api/v1/settings/{namespace}/{key}` |

## Master data (`modules/master-data`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/master-data/currencies` |
| PATCH | `/api/v1/master-data/currencies/{code}` |
| GET, POST | `/api/v1/master-data/languages` |
| PATCH | `/api/v1/master-data/languages/{code}` |
| GET, POST | `/api/v1/master-data/countries` |
| PATCH | `/api/v1/master-data/countries/{code}` |
| GET, POST | `/api/v1/master-data/provinces?countryCode=` |
| PATCH | `/api/v1/master-data/provinces/{id}` |
| GET, POST | `/api/v1/master-data/cities?provinceId=` |
| PATCH | `/api/v1/master-data/cities/{id}` |
| GET, POST | `/api/v1/master-data/destinations?locale=&parentId=` |
| GET, PATCH, DELETE | `/api/v1/master-data/destinations/{id}` (DELETE = soft-delete) |
| GET, POST | `/api/v1/master-data/product-types` |
| PATCH | `/api/v1/master-data/product-types/{id}` |
| GET, POST | `/api/v1/master-data/customer-types` |
| PATCH | `/api/v1/master-data/customer-types/{id}` |

`airports`/`airlines` are absent — deliberately, per the Sprint 1A.2 reduction and the Sprint 1B.2 scope decision (see `docs/backend/sprint-1b2-implementation-plan.md`).

## CMS (`modules/cms`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/cms/pages?websiteId=` |
| GET, PATCH, DELETE | `/api/v1/cms/pages/{id}` (DELETE = soft-delete) |
| POST | `/api/v1/cms/pages/{id}/submit-review` |
| POST | `/api/v1/cms/pages/{id}/approve` |
| POST | `/api/v1/cms/pages/{id}/publish` |
| POST | `/api/v1/cms/pages/{id}/archive` |
| GET, POST | `/api/v1/cms/pages/{id}/versions` (POST creates a new DRAFT, optionally with the full section/block tree in one call) |
| GET, POST | `/api/v1/cms/pages/{id}/sections` |
| PATCH, DELETE | `/api/v1/cms/sections/{id}` |
| GET, POST | `/api/v1/cms/sections/{id}/blocks` |
| PATCH, DELETE | `/api/v1/cms/blocks/{id}` |
| GET | `/api/v1/cms/block-definitions` (read-only catalog) |
| GET, POST | `/api/v1/cms/announcements?websiteId=` |
| PATCH | `/api/v1/cms/announcements/{id}` |
| GET (**public**) | `/api/v1/public/sites/{websiteKey}/pages/{slug}?locale=` |

The four lifecycle-transition routes (`submit-review`/`approve`/`publish`/`archive`) operate on a page's most recent version implicitly — the underlying version-scoped transitions (`CmsService.submitForReview`/`approve`/`publish`/`archive`, taking a `versionId`) remain available to a reviewer working across several pages' pending versions, just not exposed as separate routes.

## Navigation (`modules/navigation`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/cms/navigation?websiteId=` |
| GET, PATCH, DELETE | `/api/v1/cms/navigation/{id}` |
| GET, POST | `/api/v1/cms/navigation/{id}/items` |
| PATCH, DELETE | `/api/v1/cms/navigation/items/{itemId}` |
| GET (**public**) | `/api/v1/public/sites/{websiteKey}/navigation/{menuKey}?locale=` |

## FAQ (`modules/faq`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/cms/faq-categories?websiteId=` |
| PATCH, DELETE | `/api/v1/cms/faq-categories/{id}` |
| GET, POST | `/api/v1/cms/faqs?faqCategoryId=` |
| PATCH, DELETE | `/api/v1/cms/faqs/{id}` |
| GET (**public**) | `/api/v1/public/sites/{websiteKey}/faqs?locale=` |

## SEO (`modules/seo`)

| Method | Path |
|---|---|
| GET, PUT | `/api/v1/seo/metadata/{entityType}/{entityId}?websiteId=&locale=` |
| GET, POST | `/api/v1/seo/redirects?websiteId=` |
| PATCH, DELETE | `/api/v1/seo/redirects/{id}` |

`slug_history` has no direct API — it's written automatically by `SeoService.putMetadata` whenever a slug changes, per spec §15.

## Forms (`modules/forms`)

| Method | Path |
|---|---|
| GET, POST | `/api/v1/forms?websiteId=` |
| PATCH, DELETE | `/api/v1/forms/{id}` |
| GET | `/api/v1/form-submissions?websiteId=` (staff, `forms.submission.read`) |
| PATCH | `/api/v1/form-submissions/{id}` (status only) |
| POST (**public**) | `/api/v1/public/sites/{websiteKey}/forms/{formKey}/submissions` |

## Media (`modules/media`) — metadata only, no upload, no Storage bucket, no fabricated URLs

| Method | Path |
|---|---|
| GET, POST | `/api/v1/media/folders?websiteId=` (omit `websiteId` for brand-wide) |
| GET, POST | `/api/v1/media/assets?websiteId=` |
| GET, PATCH, DELETE | `/api/v1/media/assets/{id}` (DELETE = soft-delete) |

## Not in this list

Notifications and Integration Registry — no tables exist (deferred in Sprint 1A.2). Tour/Flight/Hotel/Cruise/Attraction Ticket/Booking/CRM/Payment/Marketing/AI Import — out of Sprint 1B.2 scope entirely, per the scope lock.
