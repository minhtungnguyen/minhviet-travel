import {
  SITE_URL,
  ORGANIZATION_SAME_AS,
  ORGANIZATION_NAME,
  ORGANIZATION_LOGO,
  ORGANIZATION_PHONE,
  ORGANIZATION_EMAIL,
  ORGANIZATION_ADDRESS_LOCALITY,
  ORGANIZATION_ADDRESS_COUNTRY,
} from '@/constants/seo'
import type { HomepageContent, JourneyContent } from '@/types/homepage'
import type { Tour } from '@/lib/site-data'
import type { AvailabilityStatus } from '@/types/cms'
import { buildTourCardViewModel } from '@/lib/tours/availability'
import type { TourAvailabilityStatus } from '@/types/tour-availability'
import type { FlightAirport, FlightHomeContent } from '@/types/flight'

/**
 * schema.org's ItemAvailability doesn't have a direct match for CHECKING
 * (unconfirmed, not literally out of stock) — InStock is the closest
 * accurate signal since we haven't confirmed the opposite. CLOSED means
 * the sale window itself ended, which reads to a shopper the same as
 * SoldOut even though the tour "resumes" aren't ruled out.
 */
const SCHEMA_AVAILABILITY: Record<TourAvailabilityStatus, string> = {
  AVAILABLE: 'https://schema.org/InStock',
  LIMITED: 'https://schema.org/LimitedAvailability',
  CHECKING: 'https://schema.org/InStock',
  SOLD_OUT: 'https://schema.org/SoldOut',
  CLOSED: 'https://schema.org/SoldOut',
}

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
    itemListElement: featuredJourneys.journeys.map((journey: JourneyContent, index: number) => {
      const { availability } = buildTourCardViewModel(journey)
      return {
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
            availability: SCHEMA_AVAILABILITY[availability.status],
          },
        },
      }
    }),
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

function parsePriceToNumber(price: string): number {
  return Number(price.replace(/[^\d]/g, '')) || 0
}

/**
 * Structured data for a single tour's detail page. Separate from
 * `HomepageJsonLd` — the homepage's `@graph` covers the Organization once
 * plus its featured-journeys ItemList; a tour page needs its own
 * standalone TouristTrip + Offer describing that specific product.
 */
export function TourDetailJsonLd({
  tour,
  images,
  availability,
}: {
  tour: Tour
  images: string[]
  availability: AvailabilityStatus
}) {
  const organization = {
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${ORGANIZATION_LOGO}`,
    telephone: ORGANIZATION_PHONE,
    email: ORGANIZATION_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ORGANIZATION_ADDRESS_LOCALITY,
      addressCountry: ORGANIZATION_ADDRESS_COUNTRY,
    },
    sameAs: ORGANIZATION_SAME_AS,
  }

  const trip = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: `${tour.duration} · Khởi hành từ ${tour.departure}.`,
    touristType: tour.category,
    image: images.map((src) => `${SITE_URL}${src}`),
    url: `${SITE_URL}/tour/${tour.id}`,
    provider: organization,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: parsePriceToNumber(tour.price),
      availability: availability === 'closed' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${SITE_URL}/tour/${tour.id}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(trip) }}
    />
  )
}

/**
 * Structured data for /ve-may-bay (EPIC-001 §6). Unlike the homepage's
 * `@graph`, this page's brief explicitly requires FAQPage + SearchAction +
 * BreadcrumbList in addition to Organization/WebSite, so all five are
 * emitted here rather than deferred like MICE's FAQ schema was.
 */
export function FlightHomeJsonLd({ content }: { content: FlightHomeContent }) {
  const { seo, faqs } = content
  const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`

  const organization = {
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${ORGANIZATION_LOGO}`,
    telephone: ORGANIZATION_PHONE,
    email: ORGANIZATION_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ORGANIZATION_ADDRESS_LOCALITY,
      addressCountry: ORGANIZATION_ADDRESS_COUNTRY,
    },
    sameAs: ORGANIZATION_SAME_AS,
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORGANIZATION_NAME,
    potentialAction: {
      '@type': 'SearchAction',
      /**
       * Points at the real Search Results route (EPIC-002,
       * `/ve-may-bay/tim-kiem`) — NOT `/ve-may-bay/{from}/{to}`, which is
       * reserved for the future SEO Landing Engine (EPIC-008) and must
       * stay a canonical indexable URL, not a search action target. `from`/
       * `to` here are IATA codes, matching `lib/flight/flight-search-url.ts`.
       */
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/ve-may-bay/tim-kiem?from={from}&to={to}&departureDate={departureDate}`,
      },
      'query-input': ['required name=from', 'required name=to', 'required name=departureDate'],
    },
  }

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Vé máy bay', item: canonicalUrl },
    ],
  }

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, website, breadcrumbList, faqPage],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

/**
 * Structured data for `/ve-may-bay/tim-kiem` (EPIC-002 §6: "Schema
 * SearchResultsPage" + Breadcrumb). `SearchResultsPage` is a schema.org
 * `WebPage` subtype — there's no dedicated flight-offer schema in the
 * vocabulary, so `resultCount` is carried via `mainEntity.numberOfItems`
 * on a generic `ItemList` rather than inventing one. `pageUrl` is the
 * actual `/ve-may-bay/tim-kiem?from=..&to=..` URL for this search — NOT
 * `origin.slug`/`destination.slug`, which belong to the separate, reserved
 * SEO Landing route (EPIC-008) this page must not claim to be.
 */
export function FlightSearchResultsJsonLd({
  origin,
  destination,
  resultCount,
  pageUrl,
}: {
  origin: FlightAirport
  destination: FlightAirport
  resultCount: number
  pageUrl: string
}) {
  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Vé máy bay', item: `${SITE_URL}/ve-may-bay` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${origin.city} → ${destination.city}`,
        item: pageUrl,
      },
    ],
  }

  const searchResultsPage = {
    '@type': 'SearchResultsPage',
    '@id': `${pageUrl}#search-results`,
    url: pageUrl,
    name: `Vé máy bay ${origin.city} đi ${destination.city}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: resultCount,
    },
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbList, searchResultsPage],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
