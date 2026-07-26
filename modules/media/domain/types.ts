export type MediaVisibility = 'PUBLIC' | 'PRIVATE'

export type MediaFolder = {
  id: string
  websiteId: string | null
  parentFolderId: string | null
  name: string
}

/**
 * `websiteId: null` = brand-wide, usable across every website of the
 * uploading organization (no `brand_id` column exists — removed in
 * Sprint 1A.2 as redundant with `website_id -> brands.id`; see
 * data-dictionary.md). This is the schema's existing mechanism for
 * sharing media across multiple future websites of the same brand
 * (Minh Viet Booking, MIVIGO, Checkin Cat Ba, ...) without any change here.
 */
export type MediaAsset = {
  id: string
  folderId: string | null
  websiteId: string | null
  originalFilename: string
  storagePath: string
  visibility: MediaVisibility
  mimeType: string
  fileSizeBytes: number
  width: number | null
  height: number | null
  durationSeconds: number | null
  altText: string | null
  caption: string | null
  credit: string | null
  copyrightInfo: string | null
  source: string | null
  licenseStatus: string | null
  deletedAt: string | null
}
