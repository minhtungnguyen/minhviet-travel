/**
 * Static, zero-data-fetching footer for contexts that cannot reach
 * server-only code — Next.js `error.tsx` boundaries are required to be
 * Client Components, so they cannot import the real `SiteFooter`
 * (which fetches from `navigation_menus`/settings via a server-only
 * Supabase client) without breaking the client/server bundle boundary.
 * Used only there — every ordinary page keeps the real, CMS-driven
 * `SiteFooter`.
 */
export function SiteFooterMinimal() {
  return (
    <footer className="border-t border-white/10 bg-mv-deep-navy text-white">
      <div className="container-mv flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
        <p>© {new Date().getFullYear()} Minh Việt Travel. All rights reserved.</p>
        <p>Được vận hành và phát triển bởi Minh Việt Travel.</p>
      </div>
    </footer>
  )
}
