import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { HomepageJsonLd } from '@/components/seo/json-ld'
import { getHomepageContent } from '@/lib/cms/client'
import { SITE_URL } from '@/constants/seo'
import { HeroSection } from '@/sections/hero-section'
import { TrustStripSection } from '@/sections/trust-strip-section'
import { CoreServicesSection } from '@/sections/core-services-section'
import { EnterpriseMiceSection } from '@/sections/enterprise-mice-section'
import { FeaturedJourneysSection } from '@/sections/featured-journeys-section'
import { DestinationsSection } from '@/sections/destinations-section'
import { BrandCenterSection } from '@/sections/brand-center-section'
import { ConsultationInspirationSection } from '@/sections/consultation-inspiration-section'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHomepageContent()

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
    },
  }
}

export default async function HomePage() {
  const content = await getHomepageContent()

  return (
    <SiteChrome>
      <HomepageJsonLd content={content} />
      <HeroSection />
      <TrustStripSection />
      <CoreServicesSection />
      <EnterpriseMiceSection />
      <FeaturedJourneysSection />
      <DestinationsSection />
      <BrandCenterSection />
      <ConsultationInspirationSection />
    </SiteChrome>
  )
}
