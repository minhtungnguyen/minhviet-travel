/**
 * Domain types for database/migrations/0009_cms.sql. Every content
 * table is `website_id`-scoped already — nothing here (or in the
 * service/repository below) assumes a single website. A second brand's
 * website (future MIVIGO, Checkin Cat Ba, etc.) is a new `websites` row
 * plus normal content authoring through these same types; no schema or
 * API-shape change.
 */

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type CmsPageType =
  | 'HOME'
  | 'SERVICE_HUB'
  | 'LANDING_PAGE'
  | 'STATIC_PAGE'
  | 'PROGRAM_INSPIRATION'
  | 'ARTICLE_INDEX'
  | 'PRODUCT_INDEX'
  | 'CONTACT'
  | 'POLICY'
  | 'CUSTOM'

export type CmsLifecycleStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

export type CmsPage = {
  id: string
  websiteId: string
  locale: string
  pageType: CmsPageType
  slug: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CmsPageVersion = {
  id: string
  pageId: string
  versionNumber: number
  status: CmsLifecycleStatus
  title: string
  seoMetadataId: string | null
  isCurrent: boolean
  scheduledPublishAt: string | null
  publishedAt: string | null
  createdAt: string
}

export type CmsSection = {
  id: string
  pageVersionId: string
  sectionKey: string
  position: number
}

export type CmsBlock = {
  id: string
  sectionId: string
  blockDefinitionId: string
  position: number
  /**
   * Structured JSON only — never raw HTML (master-prompt §8.7). This is
   * also the shape a future AI content generator writes to: the same
   * `config_schema` a human admin UI would validate against, exposed
   * via `CmsBlockDefinition.configSchema` for a generator to introspect.
   */
  config: Record<string, unknown>
}

export type CmsBlockDefinition = {
  id: string
  key: string
  name: string
  configSchema: Record<string, unknown>
  status: EntityStatus
}

export type Announcement = {
  id: string
  websiteId: string
  message: string
  linkHref: string | null
  startsAt: string | null
  endsAt: string | null
  status: EntityStatus
}

/** A section plus its blocks, for creating a version's whole content tree in one call. */
export type CmsSectionInput = {
  sectionKey: string
  position: number
  blocks: { blockDefinitionKey: string; position: number; config: Record<string, unknown> }[]
}
