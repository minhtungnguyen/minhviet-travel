import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { FlightArticleCard } from '@/components/flight/flight-article-card'
import { getActiveArticleTeasers } from '@/lib/insurance/insurance-repository'
import { SITE_URL } from '@/constants/seo'

export const metadata: Metadata = {
  title: 'Kiến thức bảo hiểm du lịch | Minh Việt Travel',
  description: 'Kinh nghiệm chọn gói bảo hiểm du lịch, thủ tục bồi thường và các câu hỏi thường gặp về bảo hiểm du lịch quốc tế DBV.',
  alternates: { canonical: '/insurance/kien-thuc' },
  openGraph: {
    title: 'Kiến thức bảo hiểm du lịch | Minh Việt Travel',
    description: 'Kinh nghiệm chọn gói bảo hiểm du lịch, thủ tục bồi thường và các câu hỏi thường gặp về bảo hiểm du lịch quốc tế DBV.',
    url: `${SITE_URL}/insurance/kien-thuc`,
    locale: 'vi_VN',
    type: 'website',
  },
}

export default async function InsuranceArticleIndexPage() {
  const articles = await getActiveArticleTeasers()

  return (
    <SiteChrome>
      {/* pt-28 lg:pt-48 clears SiteHeader's fixed bar (~105px mobile, ~185px desktop) — see insurance-hero.tsx's comment for the measured values. */}
      <section className="border-b border-mv-border-soft bg-mv-mist-blue/40 pb-14 pt-28 lg:pb-16 lg:pt-48">
        <div className="container-mv">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/insurance" className="transition-colors hover:text-mv-journey-blue">
              Bảo hiểm du lịch
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Kiến thức</span>
          </nav>

          <SectionHeading eyebrow="Kiến thức bảo hiểm" title="Kiến thức bảo hiểm du lịch" description={`${articles.length} bài viết.`} />
        </div>
      </section>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-mv">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <FlightArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
