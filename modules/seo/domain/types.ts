export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type RedirectKind = '301' | '302'

export type SeoMetadata = {
  id: string
  websiteId: string
  locale: string
  entityType: string
  entityId: string
  title: string
  metaDescription: string | null
  slug: string
  canonicalUrl: string | null
  isIndexed: boolean
  isFollowed: boolean
  ogTitle: string | null
  ogDescription: string | null
  ogImageMediaId: string | null
  twitterCardType: string | null
  featuredImageMediaId: string | null
  structuredData: Record<string, unknown>
  breadcrumbConfig: unknown[]
  hreflangGroupId: string | null
}

export type RedirectRule = {
  id: string
  websiteId: string
  locale: string | null
  sourcePath: string
  destinationUrl: string
  redirectKind: RedirectKind
  status: EntityStatus
  hitCount: number
}

export type SlugHistoryEntry = {
  id: string
  websiteId: string
  entityType: string
  entityId: string
  oldLocale: string
  oldSlug: string
  changedAt: string
}
