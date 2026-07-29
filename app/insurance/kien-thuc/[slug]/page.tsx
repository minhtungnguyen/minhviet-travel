import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { InsuranceArticleJsonLd } from '@/components/seo/json-ld'
import { getInsuranceArticles, getInsuranceArticleBySlug } from '@/lib/insurance/insurance-repository'
import { SITE_URL } from '@/constants/seo'

export async function generateStaticParams() {
  const articles = await getInsuranceArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getInsuranceArticleBySlug(slug)
  if (!article) return {}

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/insurance/kien-thuc/${slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `${SITE_URL}/insurance/kien-thuc/${slug}`,
      locale: 'vi_VN',
      type: 'article',
      images: [{ url: article.image.src }],
    },
  }
}

export default async function InsuranceArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getInsuranceArticleBySlug(slug)
  if (!article) notFound()

  const pageUrl = `${SITE_URL}/insurance/kien-thuc/${slug}`

  return (
    <SiteChrome>
      <InsuranceArticleJsonLd article={article} pageUrl={pageUrl} />

      {/* pt-28 lg:pt-48 clears SiteHeader's fixed bar (~105px mobile, ~185px desktop) — see insurance-hero.tsx's comment for the measured values. */}
      <section className="border-b border-mv-border-soft bg-mv-mist-blue/40 pb-14 pt-28 lg:pb-16 lg:pt-48">
        <div className="container-mv max-w-3xl">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/insurance" className="transition-colors hover:text-mv-journey-blue">
              Bảo hiểm du lịch
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/insurance/kien-thuc" className="transition-colors hover:text-mv-journey-blue">
              Kiến thức
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{article.title}</span>
          </nav>

          <h1 className="text-balance font-display text-2xl font-bold leading-tight text-mv-deep-navy sm:text-3xl">{article.title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 text-mv-journey-blue" />
            {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </section>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-mv max-w-3xl">
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={article.image.src} alt={article.image.alt} fill sizes="(min-width: 1024px) 768px, 100vw" className="object-cover" priority />
          </div>

          <div className="flex flex-col gap-5 text-base leading-relaxed text-foreground">
            {article.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <Link href="/insurance/kien-thuc" className="link-underline text-sm font-semibold text-mv-journey-blue">
              ← Xem tất cả bài viết
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
