import type { TravelInspirationHomepageConfig, TravelInspirationItem } from '@/types/inspiration'

/**
 * V1 mock repository — the seam a future CMS integration replaces (same
 * pattern as `lib/cms/client.ts`). All copy/images here are real project
 * assets, not placeholders: `demoVideoUrl` is intentionally `null` since
 * no brand story video exists in the project yet (see
 * TRAVEL_INSPIRATION_HUB_V1.md §Demo content) — this is the documented,
 * allowed "no video yet" state, not an oversight.
 */
const now = '2026-07-24T00:00:00.000Z'

export const inspirationDemoItems: TravelInspirationItem[] = [
  {
    id: 'insp-featured-video',
    slug: 'cam-xuc-hanh-trinh-cung-minh-viet-travel',
    type: 'FEATURED_VIDEO',
    status: 'PUBLISHED',
    title: 'Kiến tạo hành trình, nâng tầm trải nghiệm',
    subtitle:
      'Từ ý tưởng ban đầu đến từng khoảnh khắc đáng nhớ, Minh Việt đồng hành thiết kế và vận hành trọn vẹn hành trình của bạn.',
    excerpt: 'Cảm xúc hành trình cùng Minh Việt Travel.',
    category: 'CẢM XÚC HÀNH TRÌNH',
    tags: ['brand', 'hanh-trinh', 'cam-xuc'],
    coverImage: {
      src: '/images/hero/ha-long-bay.jpg',
      alt: 'Flycam vịnh Hạ Long với các đảo đá vôi trải dài trên mặt biển xanh ngọc',
      width: 1600,
      height: 900,
    },
    coverImageAlt: 'Flycam vịnh Hạ Long với các đảo đá vôi trải dài trên mặt biển xanh ngọc',
    // No brand story video file exists in the project yet — left null on
    // purpose (brief §VI.2: "Có thể để null. Card vẫn hiển thị cover và
    // nút Play."). FeaturedInspirationVideo/VideoModal render the
    // "đang được cập nhật" state for this, not a broken player.
    videoUrl: null,
    videoProvider: 'internal',
    videoDuration: null,
    ctaLabel: 'Xem câu chuyện hành trình',
    ctaUrl: '/brand/news',
    priority: 100,
    featured: true,
    publishFrom: now,
    publishTo: null,
    locale: 'vi',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'insp-company-trip',
    slug: 'thiet-ke-company-trip-gan-ket-doi-ngu',
    type: 'CASE_STUDY',
    status: 'PUBLISHED',
    title: 'Thiết kế Company Trip gắn kết đội ngũ',
    excerpt: 'Cách xây dựng hành trình vừa nghỉ dưỡng, vừa tăng kết nối nội bộ cho doanh nghiệp.',
    category: 'Company Trip',
    tags: ['company-trip', 'doanh-nghiep'],
    coverImage: {
      src: '/brand-group.webp',
      alt: 'Đoàn khách doanh nghiệp Minh Việt tại Nhật Bản',
      width: 800,
      height: 800,
    },
    coverImageAlt: 'Đoàn khách doanh nghiệp Minh Việt tại Nhật Bản',
    ctaLabel: 'Xem câu chuyện',
    ctaUrl: '/mice',
    priority: 80,
    featured: false,
    publishFrom: now,
    publishTo: null,
    locale: 'vi',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'insp-destination-story',
    slug: 'diem-den-truyen-cam-hung-cho-hanh-trinh-moi',
    type: 'DESTINATION_STORY',
    status: 'PUBLISHED',
    title: 'Những điểm đến truyền cảm hứng cho hành trình mới',
    excerpt: 'Gợi ý điểm đến phù hợp cho doanh nghiệp, gia đình và nhóm khách riêng.',
    category: 'Điểm đến',
    tags: ['diem-den'],
    coverImage: {
      src: '/dest-thailand.webp',
      alt: 'Điểm đến Thái Lan',
      width: 800,
      height: 800,
    },
    coverImageAlt: 'Điểm đến Thái Lan',
    ctaLabel: 'Khám phá điểm đến',
    ctaUrl: '/tours',
    priority: 70,
    featured: false,
    publishFrom: now,
    publishTo: null,
    locale: 'vi',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'insp-mice-insight',
    slug: 'tu-concept-den-van-hanh-mot-su-kien-tron-ven',
    type: 'MICE_INSIGHT',
    status: 'PUBLISHED',
    title: 'Từ concept đến vận hành một sự kiện trọn vẹn',
    excerpt: 'Minh Việt đồng hành từ ý tưởng, thiết kế chương trình đến tổ chức và nghiệm thu.',
    category: 'MICE',
    tags: ['mice', 'su-kien'],
    coverImage: {
      src: '/enterprise-mice.webp',
      alt: 'Sự kiện MICE do Minh Việt tổ chức',
      width: 800,
      height: 800,
    },
    coverImageAlt: 'Sự kiện MICE do Minh Việt tổ chức',
    ctaLabel: 'Khám phá giải pháp MICE',
    ctaUrl: '/mice',
    priority: 60,
    featured: false,
    publishFrom: now,
    publishTo: null,
    locale: 'vi',
    createdAt: now,
    updatedAt: now,
  },
]

export const inspirationHomepageConfigDemo: TravelInspirationHomepageConfig = {
  featuredItemId: 'insp-featured-video',
  supportingItemIds: ['insp-company-trip', 'insp-destination-story', 'insp-mice-insight'],
  sectionTitle: 'Travel Inspiration Hub',
  sectionSubtitle: 'Trung tâm truyền cảm hứng du lịch',
  isEnabled: true,
  displayFrom: null,
  displayUntil: null,
  locale: 'vi',
  updatedBy: 'seed',
  updatedAt: now,
}

function isPublishedAndInWindow(item: TravelInspirationItem, at: number): boolean {
  if (item.status !== 'PUBLISHED') return false
  if (item.publishFrom && new Date(item.publishFrom).getTime() > at) return false
  if (item.publishTo && new Date(item.publishTo).getTime() < at) return false
  return true
}

export interface HomepageInspirationResolution {
  sectionTitle: string
  sectionSubtitle: string
  featured: TravelInspirationItem | null
  supporting: TravelInspirationItem[]
}

/**
 * Frontend resolution logic for brief §XI's curator contract — the part
 * explicitly asked for without a database: given a config + item pool,
 * resolve what's actually safe to render. A real CMS integration would
 * run the same rules server-side; this keeps the section's rendering
 * code CMS-agnostic (it only ever sees the resolved `featured`/
 * `supporting` items, never the raw config or unpublished items).
 */
export function getHomepageInspiration(
  config: TravelInspirationHomepageConfig = inspirationHomepageConfigDemo,
  items: TravelInspirationItem[] = inspirationDemoItems,
  now: Date = new Date(),
): HomepageInspirationResolution {
  const empty: HomepageInspirationResolution = {
    sectionTitle: config.sectionTitle,
    sectionSubtitle: config.sectionSubtitle,
    featured: null,
    supporting: [],
  }

  if (!config.isEnabled) return empty

  const at = now.getTime()
  if (config.displayFrom && new Date(config.displayFrom).getTime() > at) return empty
  if (config.displayUntil && new Date(config.displayUntil).getTime() < at) return empty

  const eligible = items.filter((item) => isPublishedAndInWindow(item, at))
  const byId = new Map(eligible.map((item) => [item.id, item]))

  let featured = byId.get(config.featuredItemId) ?? null
  // Fallback: highest-priority published item if the configured featured
  // item is missing, unpublished, or outside its publish window.
  if (!featured) {
    featured = [...eligible].sort((a, b) => b.priority - a.priority)[0] ?? null
  }

  const supporting = config.supportingItemIds
    .map((id) => byId.get(id))
    .filter((item): item is TravelInspirationItem => Boolean(item))
    // A supporting slot can never duplicate the featured item.
    .filter((item) => item.id !== featured?.id)
    .slice(0, 3)

  return {
    sectionTitle: config.sectionTitle,
    sectionSubtitle: config.sectionSubtitle,
    featured,
    supporting,
  }
}
