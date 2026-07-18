import { SITE_URL, ORGANIZATION_SAME_AS } from '@/constants/seo'
import type { HomepageContent, JourneyContent } from '@/types/homepage'

/**
 * Server-rendered JSON-LD. Structured data lives here, not scattered
 * across sections, so the schema stays a single reviewable artifact —
 * see the redesign plan's SEO Structure section.
 */
export function HomepageJsonLd({ content }: { content: HomepageContent }) {
  const { seo, featuredJourneys } = content

  const organization = {
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: seo.organizationName,
    url: SITE_URL,
    logo: `${SITE_URL}${seo.organizationLogo}`,
    telephone: seo.contactPhone,
    email: seo.contactEmail,
    address: {
      '@type': 'PostalAddress',
      addressLocality: seo.addressLocality,
      addressCountry: seo.addressCountry,
    },
    sameAs: ORGANIZATION_SAME_AS,
  }

  const itemList = {
    '@type': 'ItemList',
    name: featuredJourneys.title + ' ' + featuredJourneys.titleAccent,
    itemListElement: featuredJourneys.journeys.map((journey: JourneyContent, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}${journey.href}`,
      item: {
        '@type': 'TouristTrip',
        name: journey.title,
        touristType: journey.category,
        offers: {
          '@type': 'Offer',
          priceCurrency: journey.currency,
          price: journey.priceFrom,
          availability:
            journey.availability === 'closed'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
        },
      },
    })),
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, itemList],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
