export const SITE_URL = 'https://www.minhviettravel.com'

export const DEFAULT_LOCALE = 'vi_VN'

export const ORGANIZATION_SAME_AS = [
  'https://www.facebook.com/minhviettravel',
  'https://www.youtube.com/@minhviettravel',
  'https://www.linkedin.com/company/minhviettravel',
] as const

/**
 * Mirrors the values already seeded in lib/cms/content/homepage.seed.ts
 * (`seo.organizationName`, etc.) so pages outside the homepage's CMS seam
 * — e.g. Tour Detail's JSON-LD — describe the same legal entity instead
 * of drifting into a second, slightly different copy.
 */
export const ORGANIZATION_NAME = 'Công ty Cổ phần Thương mại & Dịch vụ Du lịch Minh Việt'
export const ORGANIZATION_LOGO = '/logo-minhviet.png'
export const ORGANIZATION_PHONE = '+84934368132'
export const ORGANIZATION_EMAIL = 'info@minhviettravel.com'
export const ORGANIZATION_ADDRESS_LOCALITY = 'Hải Phòng'
export const ORGANIZATION_ADDRESS_COUNTRY = 'VN'
