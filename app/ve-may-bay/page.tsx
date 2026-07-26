import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightHomeJsonLd } from '@/components/seo/json-ld'
import { getFlightHomeContent } from '@/lib/flight/flight-repository'
import { SITE_URL } from '@/constants/seo'
import { FlightHero } from '@/components/flight/flight-hero'
import { FlightFlashSaleSection } from '@/components/flight/flight-flash-sale-section'
import { FlightPopularRoutesSection } from '@/components/flight/flight-popular-routes-section'
import { FlightAirlinesSection } from '@/components/flight/flight-airlines-section'
import { FlightTravelGuideSection } from '@/components/flight/flight-travel-guide-section'
import { FlightFaqSection } from '@/components/flight/flight-faq-section'
import { FlightFinalCta } from '@/components/flight/flight-final-cta'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getFlightHomeContent()

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalPath },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}${seo.canonicalPath}`,
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: seo.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  }
}

/**
 * EPIC-001 – Flight Homepage (B2C). Distinct from the existing `/flights`
 * B2B corporate-travel page, which this epic does not touch — see
 * docs/PRD/Flight/EPIC-001-Flight-Homepage.md.
 */
export default async function FlightHomePage() {
  const content = await getFlightHomeContent()

  return (
    <SiteChrome>
      <FlightHomeJsonLd content={content} />
      <FlightHero hero={content.hero} searchBox={content.searchBox} />
      <FlightFlashSaleSection flashSales={content.flashSales} airports={content.searchBox.airports} />
      <FlightPopularRoutesSection routes={content.popularRoutes} />
      <FlightAirlinesSection airlines={content.airlines} />
      <FlightTravelGuideSection articles={content.articles} />
      <FlightFaqSection faqs={content.faqs} />
      <FlightFinalCta finalCta={content.finalCta} />
    </SiteChrome>
  )
}
