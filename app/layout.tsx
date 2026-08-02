import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SkipLink } from '@/components/layout/skip-link'
import { AnnouncementModal } from '@/components/site/announcement-modal'
import { SITE_URL } from '@/constants/seo'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import { resolveSiteWideSeoSettings } from '@/lib/seo/default-metadata'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Minh Việt Travel — Kiến tạo hành trình, kết nối giá trị',
  description:
    'Đối tác tin cậy của doanh nghiệp, tổ chức & khách hàng cao cấp. Tour đoàn, MICE & Sự kiện, Khách sạn, Du thuyền, Vé máy bay, Visa và Bảo hiểm — trải nghiệm sang trọng, chuyên nghiệp, ứng dụng AI.',
  keywords: [
    'Minh Việt Travel',
    'du lịch doanh nghiệp',
    'MICE',
    'tour đoàn',
    'team building',
    'corporate travel',
    'du thuyền cao cấp',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Sprint 5A: these 3 settings were `analytics.*`/`facebook.pixel_id` —
 * defined since earlier sprints but deliberately left un-injected (seed
 * comment: "chưa được nối vào trang public"). Made `visibility = 'PUBLIC'`
 * (was `INTERNAL`) so the anon client used on every marketing page can
 * read them — safe: a GA4/GTM/Pixel id is never a secret, it's always
 * visible in any site's public page source the moment it's wired up like
 * this. Falls back to empty strings (renders no script tags) on any error
 * — a settings-read hiccup must never break every page on the site.
 */
async function getTrackingIds(): Promise<{ ga4Id: string; gtmId: string; pixelId: string }> {
  try {
    const client = getPublicSupabaseClient()
    const settings = new SettingsService(new SupabaseSettingsRepository(client), () => Promise.resolve())
    const [ga4, gtm, pixel] = await Promise.all([
      settings.getSetting('analytics.ga4_measurement_id', {}),
      settings.getSetting('analytics.gtm_container_id', {}),
      settings.getSetting('facebook.pixel_id', {}),
    ])
    return {
      ga4Id: String(ga4.resolved.value || ''),
      gtmId: String(gtm.resolved.value || ''),
      pixelId: String(pixel.resolved.value || ''),
    }
  } catch {
    return { ga4Id: '', gtmId: '', pixelId: '' }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [{ ga4Id, gtmId, pixelId }, { googleSiteVerification, bingSiteVerification, facebookAppId }] = await Promise.all([
    getTrackingIds(),
    resolveSiteWideSeoSettings(getPublicSupabaseClient()),
  ])

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${jakarta.variable} bg-background`}
    >
      <head>
        {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
        {bingSiteVerification && <meta name="msvalidate.01" content={bingSiteVerification} />}
        {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        {!gtmId && ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
            </Script>
          </>
        )}
        {pixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        )}
      </head>
      <body className="font-sans antialiased">
        {gtmId && (
          <noscript>
            <iframe
              title="gtm"
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <SkipLink />
        {children}
        <AnnouncementModal />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
