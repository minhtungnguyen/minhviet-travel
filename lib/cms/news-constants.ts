/**
 * Slug prefix convention for News articles modeled as ordinary `cms_pages`
 * (see lib/cms/news.ts). Kept in its own tiny, side-effect-free module
 * (not `news.ts`, which has `import 'server-only'`) so client components
 * (e.g. the News create form) can import the constant without pulling in
 * a server-only module.
 */
export const NEWS_SLUG_PREFIX = 'brand/news/'
