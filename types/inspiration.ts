import type { CmsImage } from '@/types/cms'

/**
 * Sprint UI-03 — Travel Inspiration Hub V1 data contract. This is the
 * shape a future CMS (Sanity/Contentful/Supabase — same pattern as
 * `lib/cms/client.ts`) would need to satisfy; V1 only ships a mock
 * repository (`lib/inspiration/inspiration-demo-data.ts`) against it.
 */
export type InspirationContentType =
  | 'FEATURED_VIDEO'
  | 'JOURNEY_STORY'
  | 'DESTINATION_STORY'
  | 'MICE_INSIGHT'
  | 'CASE_STUDY'
  | 'GALLERY'
  | 'FEATURED_TOUR'
  | 'FEATURED_HOTEL'
  | 'FEATURED_CRUISE'
  | 'TRAVEL_GUIDE'
  | 'CUSTOMER_STORY'
  | 'CAMPAIGN'

export type InspirationContentStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

export type InspirationVideoProvider = 'internal' | 'youtube' | 'vimeo'

export interface TravelInspirationItem {
  id: string
  slug: string
  type: InspirationContentType
  status: InspirationContentStatus
  title: string
  subtitle?: string
  excerpt: string
  /** Long-form body for a future detail page — unused by the Homepage V1 cards. */
  content?: string
  category: string
  tags: string[]
  coverImage: CmsImage
  coverImageAlt: string
  gallery?: CmsImage[]
  /** Null/undefined is a valid, expected state in V1 — see FeaturedInspirationVideo's "coming soon" fallback. */
  videoUrl?: string | null
  videoProvider?: InspirationVideoProvider
  /** Only rendered when present — never fabricated (Volume 01 authenticity rule). */
  videoDuration?: string | null
  destination?: string
  targetAudience?: string[]
  season?: string
  ctaLabel: string
  ctaUrl: string
  /** Higher wins when the curator config's fallback logic picks a replacement item. */
  priority: number
  featured: boolean
  publishFrom?: string | null
  publishTo?: string | null
  locale: string
  seoTitle?: string
  metaDescription?: string
  ogImage?: string
  createdAt: string
  updatedAt: string
}

/**
 * What a future CMS "Homepage Placement" screen would write — which
 * published items go in the Featured slot vs. the 3 Supporting slots.
 * `lib/inspiration/inspiration-demo-data.ts`'s `getHomepageInspiration()`
 * is the frontend resolution logic described in the brief §XI (fallback
 * to highest-priority published item, exclude Draft/Archived/expired,
 * no id overlap between featured and supporting).
 */
export interface TravelInspirationHomepageConfig {
  featuredItemId: string
  /** Max 3 in V1 — enforced by the resolver, not just documented here. */
  supportingItemIds: string[]
  sectionTitle: string
  sectionSubtitle: string
  isEnabled: boolean
  displayFrom?: string | null
  displayUntil?: string | null
  locale: string
  updatedBy: string
  updatedAt: string
}
