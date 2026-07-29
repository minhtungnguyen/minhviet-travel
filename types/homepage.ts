import type { CmsImage, CmsLink, ConfidenceLevel, PriceType, VerifiedStat } from '@/types/cms'
import type { TourDeparture } from '@/types/tour-availability'

export interface HeroContent {
  eyebrow: string
  headline: string
  headlineAccent: string
  subhead: string
  primaryCta: CmsLink
  secondaryCta: CmsLink
  backgroundImage: CmsImage
  proofStat: VerifiedStat
}

export interface AudienceSegment {
  id: string
  label: string
  icon: 'building' | 'landmark' | 'users' | 'briefcase'
}

export interface PartnerLogo {
  id: string
  name: string
  wordmarkImage?: CmsImage
  category: 'airline' | 'hotel' | 'other'
}

export interface TrustStripContent {
  eyebrow: string
  positioning: {
    headline: string
    description: string
  }
  segments: AudienceSegment[]
  stats: VerifiedStat[]
  partners: PartnerLogo[]
}

export interface ServiceTile {
  id: string
  title: string
  icon: 'group' | 'briefcase' | 'sparkles' | 'building' | 'ship' | 'plane' | 'ticket' | 'globe'
  href: string
}

export interface ServiceGroup {
  id: string
  label: string
  services: ServiceTile[]
}

export interface CoreServicesContent {
  eyebrow: string
  title: string
  groups: ServiceGroup[]
}

export interface EnterpriseMiceContent {
  badge: string
  title: string
  description: string
  story: string
  process: string[]
  proofStat: VerifiedStat
  image: CmsImage
  cta: CmsLink
}

export interface AIAdvisorQuestion {
  id: 'budget' | 'groupSize' | 'preference'
  label: string
  placeholder: string
  options: { value: string; label: string }[]
}

export interface AIAdvisorContent {
  eyebrow: string
  title: string
  titleAccent: string
  description: string
  disclosureNote: string
  questions: AIAdvisorQuestion[]
  humanHandoffCta: CmsLink
}

export interface JourneyContent {
  id: string
  title: string
  country: string
  category: 'asia' | 'europe' | 'domestic'
  duration: string
  priceFrom: number
  priceType: PriceType
  currency: 'VND'
  /**
   * Availability/departure-point/next-date all now live per departure
   * (see `types/tour-availability.ts`), not on the tour — a tour can
   * have departures in every status at once. `lib/tours/availability.ts`'s
   * `buildTourCardViewModel()` resolves which one the card actually
   * shows. Can be empty (a tour with no scheduled departures yet) —
   * the resolver handles that as an honest CHECKING state, not an error.
   */
  departures: TourDeparture[]
  reviewScore?: number
  reviewCount?: number
  image: CmsImage
  href: string
  matchTags: string[]
}

export interface FeaturedJourneysContent {
  eyebrow: string
  title: string
  titleAccent: string
  filters: { id: JourneyContent['category'] | 'all'; label: string }[]
  journeys: JourneyContent[]
  viewAllCta: CmsLink
}

export interface DestinationContent {
  id: string
  name: string
  tagline: string
  journeyCount: number
  image: CmsImage
  href: string
}

export interface DestinationsContent {
  eyebrow: string
  title: string
  titleAccent: string
  destinations: DestinationContent[]
}

export interface BrandStoryContent {
  id: string
  category: string
  title: string
  description: string
  date: string
  image: CmsImage
  href: string
  size: 'large' | 'small'
}

export interface BrandCenterContent {
  eyebrow: string
  title: string
  description: string
  stories: BrandStoryContent[]
  cta: CmsLink
}

export interface FinalCtaContent {
  corporate: {
    eyebrow: string
    label: string
    title: string
    description: string
    cta: CmsLink
  }
  individual: {
    eyebrow: string
    label: string
    title: string
    description: string
    cta: CmsLink
  }
  phone: string
  zaloHref: string
}

export interface HomepageSeoContent {
  title: string
  description: string
  canonicalPath: string
  organizationName: string
  organizationLogo: string
  contactPhone: string
  contactEmail: string
  addressLocality: string
  addressCountry: string
}

export interface HomepageContent {
  hero: HeroContent
  trustStrip: TrustStripContent
  coreServices: CoreServicesContent
  enterpriseMice: EnterpriseMiceContent
  aiAdvisor: AIAdvisorContent
  featuredJourneys: FeaturedJourneysContent
  destinations: DestinationsContent
  brandCenter: BrandCenterContent
  finalCta: FinalCtaContent
  seo: HomepageSeoContent
}

export type { ConfidenceLevel }
