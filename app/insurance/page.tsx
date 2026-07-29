import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { InsuranceLandingJsonLd } from '@/components/seo/json-ld'
import { InsuranceHero } from '@/components/insurance/insurance-hero'
import { InsuranceWhyBuySection } from '@/components/insurance/insurance-why-buy-section'
import { InsuranceCalculatorSection } from '@/components/insurance/insurance-calculator-section'
import { InsuranceBenefitsSection } from '@/components/insurance/insurance-benefits-section'
import { InsuranceCompareTable } from '@/components/insurance/insurance-compare-table'
import { InsuranceFaqSection } from '@/components/insurance/insurance-faq-section'
import { InsuranceArticlesSection } from '@/components/insurance/insurance-articles-section'
import { InsuranceFinalCta } from '@/components/insurance/insurance-final-cta'
import { getInsuranceLandingContent, getActiveFaqs, getActiveArticleTeasers } from '@/lib/insurance/insurance-repository'
import { getHomepageContent } from '@/lib/cms/client'
import { SITE_URL } from '@/constants/seo'

const INSURANCE_SERVICE_OPTION = { value: 'insurance', label: 'Bảo hiểm du lịch' }

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getInsuranceLandingContent()
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
  }
}

export default async function InsurancePage() {
  const content = await getInsuranceLandingContent()
  const articles = await getActiveArticleTeasers()
  const { coreServices, finalCta: homepageFinalCta } = await getHomepageContent()

  const existingServiceOptions = coreServices.groups.flatMap((group) => group.services).map((service) => ({ value: service.id, label: service.title }))
  const serviceOptions = existingServiceOptions.some((o) => o.value === INSURANCE_SERVICE_OPTION.value)
    ? existingServiceOptions
    : [INSURANCE_SERVICE_OPTION, ...existingServiceOptions]

  return (
    <SiteChrome>
      <InsuranceLandingJsonLd content={content} />
      <InsuranceHero content={content.hero} />
      <InsuranceWhyBuySection content={content.whyBuy} />
      <InsuranceCalculatorSection plans={content.plans} premiumRates={content.premiumRates} finalCtaContent={homepageFinalCta} serviceOptions={serviceOptions} />
      <InsuranceBenefitsSection benefitRows={content.benefitRows} />
      <InsuranceCompareTable plans={content.plans} rows={content.benefitRows} />
      <InsuranceFaqSection faqs={getActiveFaqs(content)} />
      <InsuranceArticlesSection articles={articles} />
      <InsuranceFinalCta finalCta={content.finalCta} provider={content.provider} />
    </SiteChrome>
  )
}
