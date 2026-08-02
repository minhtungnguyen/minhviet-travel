/**
 * Slug prefix convention for News articles modeled as ordinary `cms_pages`
 * (see lib/cms/news.ts). Kept in its own tiny, side-effect-free module
 * (not `news.ts`, which has `import 'server-only'`) so client components
 * (e.g. the News create form) can import the constant without pulling in
 * a server-only module.
 *
 * Sprint 5A: public route is `/tin-tuc/[slug]` (Founder decision — not
 * `/brand/news/*`), so the stored slug prefix matches the real URL
 * 1:1 (no separate DB-slug ↔ route translation layer to maintain).
 * No real articles existed before this change (Phase 4 report: 0 bài
 * viết), so there is nothing to migrate/rename.
 */
export const NEWS_SLUG_PREFIX = 'tin-tuc/'
