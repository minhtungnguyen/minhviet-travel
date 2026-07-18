import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { MobileCTA } from '@/components/site/mobile-cta'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">{children}</main>
      <SiteFooter />
      <MobileCTA />
    </div>
  )
}
