import { SiteHeader } from '@/components/site/site-header'
import { SiteFooterMinimal } from '@/components/site/site-footer-minimal'
import { MobileCTA } from '@/components/site/mobile-cta'

/**
 * `SiteChrome`'s equivalent for `error.tsx` boundaries specifically.
 * Next.js requires `error.tsx` to be a Client Component, so it cannot
 * import `SiteChrome` directly — that module statically imports the
 * real `SiteFooter`, which reaches server-only code (Supabase, audit
 * logger) to render real CMS/settings-driven content. A bundler error
 * (`'server-only' cannot be imported from a Client Component module`)
 * happens purely from that import existing in the module graph, whether
 * or not it's ever actually rendered — conditional rendering doesn't
 * help, only avoiding the import entirely does. Use this instead of
 * `SiteChrome` in any `error.tsx`.
 */
export function ErrorPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">{children}</main>
      <SiteFooterMinimal />
      <MobileCTA />
    </div>
  )
}
