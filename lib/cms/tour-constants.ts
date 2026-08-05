/**
 * Slug prefix convention for Tours modeled as ordinary `cms_pages`
 * (Sprint 7 Phase 0 GAP Matrix decision — same architecture as News,
 * see lib/cms/news-constants.ts). Kept in its own tiny, side-effect-free
 * module so client components (e.g. the Tour create form) can import the
 * constant without pulling in a server-only module.
 *
 * Public route is `/tour/[slug]` (matches the real route already live in
 * app/tour/[slug]/page.tsx, currently backed by hardcoded data — Sprint 7
 * Phase 6 rewrites it onto real cms_pages rows), so the stored slug
 * prefix matches the real URL 1:1, same reasoning as News' `tin-tuc/`.
 */
export const TOUR_SLUG_PREFIX = 'tour/'
