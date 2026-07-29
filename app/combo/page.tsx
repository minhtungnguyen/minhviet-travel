import type { Metadata } from 'next'
import Link from 'next/link'
import { getComboLandingContent, getPublishedCombos, getPublishedCategories, getPublishedDestinations } from '@/lib/combo/combo-repository'
import { SiteChrome } from '@/components/site/site-chrome'
import { ComboHero } from '@/components/combo/combo-hero'
import { ComboFeaturedSection } from '@/components/combo/combo-featured-section'
import { ComboCategorySection } from '@/components/combo/combo-category-section'
import { ComboDestinationExplorerSection } from '@/components/combo/combo-destination-explorer-section'
import { ComboWhySection } from '@/components/combo/combo-why-section'
import { ComboArticlesSection } from '@/components/combo/combo-articles-section'
import { ComboFinalCta } from '@/components/combo/combo-final-cta'
import { ComboConsultationForm } from '@/components/combo/combo-consultation-form'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getComboLandingContent()
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalPath },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `https://www.minhviettravel.com${seo.canonicalPath}`,
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: seo.ogImage }],
    },
  }
}

/** Related-links row — internal linking for SEO, same pattern as `app/mice/page.tsx`. */
function RelatedLinks() {
  const links = [
    { label: 'Tour thiết kế riêng', href: '/tour-thiet-ke' },
    { label: 'Khách sạn', href: '/hotels' },
    { label: 'Du thuyền', href: '/cruises' },
    { label: 'Vé máy bay', href: '/ve-may-bay' },
    { label: 'Liên hệ', href: '/contact' },
  ]
  return (
    <div className="border-t border-border bg-background py-8">
      <div className="container-mv flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold text-mv-deep-navy">Tìm hiểu thêm:</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-mv-journey-blue hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function ComboPage() {
  const content = await getComboLandingContent()
  const combos = getPublishedCombos(content).slice(0, 8)
  const categories = getPublishedCategories(content)
  const destinations = getPublishedDestinations(content)

  return (
    <SiteChrome>
      <ComboHero hero={content.hero} />
      <ComboFeaturedSection combos={combos} />
      <ComboCategorySection categories={categories} />
      <ComboDestinationExplorerSection
        eyebrow={content.destinationExplorer.eyebrow}
        title={content.destinationExplorer.title}
        description={content.destinationExplorer.description}
        destinations={destinations}
      />
      <ComboWhySection
        eyebrow={content.whyCombo.eyebrow}
        title={content.whyCombo.title}
        description={content.whyCombo.description}
        items={content.whyCombo.items}
      />
      <ComboArticlesSection articles={content.articles} />
      <RelatedLinks />
      <ComboFinalCta finalCta={content.finalCta} />
      <ComboConsultationForm />
    </SiteChrome>
  )
}
