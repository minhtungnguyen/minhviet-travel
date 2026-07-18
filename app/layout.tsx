import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SkipLink } from '@/components/layout/skip-link'
import { SITE_URL } from '@/constants/seo'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${jakarta.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <SkipLink />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
