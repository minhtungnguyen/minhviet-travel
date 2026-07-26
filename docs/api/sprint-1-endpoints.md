# Sprint 1 Endpoint Surface

**Historical — superseded by `docs/api/sprint-1b2-endpoints.md`.** Kept as a record of Sprint 1A's original 3-route reference implementation; the "target surface for Sprint 1B" table below is now built and its shape changed in places during implementation (e.g. brands/websites got full CRUD + archive, forms/CMS/SEO gained many more routes than sketched here). Do not treat this file as current.

## Implemented in Sprint 1A (real route handler files, not exercised against a live DB)

| Method | Path | File |
|---|---|---|
| GET | `/api/v1/organizations` | `app/api/v1/organizations/route.ts` |
| POST | `/api/v1/organizations` | `app/api/v1/organizations/route.ts` |
| GET | `/api/v1/organizations/{id}` | `app/api/v1/organizations/[id]/route.ts` |
| PATCH | `/api/v1/organizations/{id}` | `app/api/v1/organizations/[id]/route.ts` |
| GET | `/api/v1/roles` | `app/api/v1/roles/route.ts` |

## Target surface for Sprint 1B (documented, not yet built — same shape as above)

| Method | Path | Module |
|---|---|---|
| GET/POST | `/api/v1/brands` | organization |
| GET/PATCH | `/api/v1/brands/{id}` | organization |
| GET/POST | `/api/v1/websites` | organization |
| GET/PATCH | `/api/v1/websites/{id}` | organization |
| GET/POST | `/api/v1/departments` | organization |
| GET/POST/PATCH | `/api/v1/permissions`, `/api/v1/role-permissions` | access-control |
| POST/DELETE | `/api/v1/users/{id}/roles` | access-control |
| GET/PATCH | `/api/v1/users/{id}` | access-control |
| GET/PUT | `/api/v1/settings` (query by scope + key) | settings |
| GET | `/api/v1/master-data/destinations`, `.../countries`, `.../product-types`, etc. | master-data |
| GET/PATCH | `/api/v1/master-data/destinations/{id}` | master-data |
| POST | `/api/v1/media` (upload) | media |
| GET | `/api/v1/media`, `/api/v1/media/{id}` | media |
| GET/POST | `/api/v1/cms/pages` | cms |
| GET/PATCH/POST | `/api/v1/cms/pages/{id}`, `.../versions`, `.../publish` | cms |
| GET/PUT | `/api/v1/cms/navigation/{menuKey}` | cms |
| GET/POST | `/api/v1/cms/faqs` | cms |
| GET | `/api/v1/forms/{formKey}` (public: catalog row only — fields come from the code-defined Zod schema, not the database, per `docs/playbooks/configure-form.md`) | forms |
| POST | `/api/v1/forms/{formKey}/submissions` (public, server-role only — no direct RLS insert, see `rls-policy-matrix.md`) | forms |
| GET | `/api/v1/forms/{formKey}/submissions` (staff) | forms |
| GET/PUT | `/api/v1/seo/metadata` (query by entity) | seo |
| GET/POST | `/api/v1/seo/redirects` | seo |
| GET | `/api/v1/audit-logs` (staff, `audit.read`) | audit |

Every one of these follows `docs/api/api-conventions.md` exactly — same envelope, same pagination schema, same `requirePermission` pattern demonstrated in the organizations routes.

## Not in this list: Notifications and Integration Registry

Both modules were deferred entirely in Sprint 1A.2 (`docs/backend/sprint-1a2-reduction-report.md` §5/§6) — no tables exist for them yet, so no endpoint is documented here either. `GET /api/v1/notifications` and `GET/POST /api/v1/integrations` return to this list once those modules' migrations do.
