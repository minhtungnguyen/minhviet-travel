import type { FlightAirport, FlightHomeContent } from '@/types/flight'
import { buildFlightSearchPath, DEFAULT_FLASH_SALE_SEARCH_OFFSET_DAYS } from '@/lib/flight/flight-search-url'

/**
 * Mock repository data for /ve-may-bay (EPIC-001 – Flight Homepage) and its
 * Search Results route (EPIC-002 – `/ve-may-bay/[from]/[to]`), the
 * CMS-ready seam described in `types/flight.ts`. This is Mock Data only —
 * no airline API is wired up (see `integrations/flight/contracts/flight-provider.ts`
 * for the eventual real-fare contract, out of scope here). Fare figures,
 * validity windows and airline route maps below are illustrative
 * placeholders for UI development, not live commercial offers.
 *
 * Flash Sale / Popular Route imagery reuses existing destination
 * photography from `/public` (no Flight-specific photography has been
 * shot yet) — a couple of domestic routes are paired with the closest
 * available Vietnam landscape image rather than an exact city match;
 * swap for real route photography when a CMS/DAM is wired up.
 */

/**
 * Single source of truth for every airport referenced below — `slug` is
 * hand-picked (not mechanically derived from `city`) so it matches
 * `docs/PRD/Flight/EPIC-002-Flight-Search-Results.md` §6's friendly-URL
 * example verbatim (`/ve-may-bay/hai-phong/ho-chi-minh`).
 */
const airports: FlightAirport[] = [
  { code: 'HPH', slug: 'hai-phong', city: 'Hải Phòng', name: 'Sân bay Cát Bi', country: 'Việt Nam' },
  { code: 'HAN', slug: 'ha-noi', city: 'Hà Nội', name: 'Sân bay Nội Bài', country: 'Việt Nam' },
  { code: 'SGN', slug: 'ho-chi-minh', city: 'TP. Hồ Chí Minh', name: 'Sân bay Tân Sơn Nhất', country: 'Việt Nam' },
  { code: 'DAD', slug: 'da-nang', city: 'Đà Nẵng', name: 'Sân bay Đà Nẵng', country: 'Việt Nam' },
  { code: 'PQC', slug: 'phu-quoc', city: 'Phú Quốc', name: 'Sân bay Phú Quốc', country: 'Việt Nam' },
  { code: 'CXR', slug: 'nha-trang', city: 'Nha Trang', name: 'Sân bay Cam Ranh', country: 'Việt Nam' },
  { code: 'HUI', slug: 'hue', city: 'Huế', name: 'Sân bay Phú Bài', country: 'Việt Nam' },
  { code: 'DLI', slug: 'da-lat', city: 'Đà Lạt', name: 'Sân bay Liên Khương', country: 'Việt Nam' },
  { code: 'VCA', slug: 'can-tho', city: 'Cần Thơ', name: 'Sân bay Cần Thơ', country: 'Việt Nam' },
  { code: 'VII', slug: 'vinh', city: 'Vinh', name: 'Sân bay Vinh', country: 'Việt Nam' },
  { code: 'SIN', slug: 'singapore', city: 'Singapore', name: 'Sân bay Changi', country: 'Singapore' },
  { code: 'BKK', slug: 'bangkok', city: 'Bangkok', name: 'Sân bay Suvarnabhumi', country: 'Thái Lan' },
  { code: 'NRT', slug: 'tokyo', city: 'Tokyo', name: 'Sân bay Narita', country: 'Nhật Bản' },
]

/** Exported for the Search Results route (EPIC-002), which resolves `[from]/[to]` slugs against this same list. */
export const flightAirports = airports

const airportByCode = new Map(airports.map((airport) => [airport.code, airport]))
const airportBySlug = new Map(airports.map((airport) => [airport.slug, airport]))

function airport(code: string): FlightAirport {
  const found = airportByCode.get(code)
  if (!found) throw new Error(`Unknown mock airport code: ${code}`)
  return found
}

/** Used by the Search Results route (EPIC-002) to resolve `[from]/[to]` slugs — returns `undefined` for an unknown slug so the caller can 404. */
export function findFlightAirportBySlug(slug: string): FlightAirport | undefined {
  return airportBySlug.get(slug)
}

/** Default departure date used by CTAs (Flash Sale, Popular Routes) that link into Search Results without a user-picked date yet. */
const defaultSearchDate = new Date(Date.now() + DEFAULT_FLASH_SALE_SEARCH_OFFSET_DAYS * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

function searchResultsHref(originCode: string, destinationCode: string) {
  const origin = airport(originCode)
  const destination = airport(destinationCode)
  return buildFlightSearchPath(
    { originSlug: origin.slug, destinationSlug: destination.slug },
    { tripType: 'oneway', departDate: defaultSearchDate, adults: 1, children: 0, infants: 0, cabinClass: 'economy' },
  )
}

export const flightAirlines = [
  { id: 'air-vn', code: 'VN', name: 'Vietnam Airlines', shortName: 'Vietnam Airlines', isInternational: true, order: 1, isActive: true },
  { id: 'air-vj', code: 'VJ', name: 'Vietjet Air', shortName: 'Vietjet Air', isInternational: true, order: 2, isActive: true },
  { id: 'air-qh', code: 'QH', name: 'Bamboo Airways', shortName: 'Bamboo Airways', isInternational: true, order: 3, isActive: true },
  { id: 'air-vu', code: 'VU', name: 'Vietravel Airlines', shortName: 'Vietravel Airlines', isInternational: false, order: 4, isActive: true },
]

export const flightHomeContentSeed: FlightHomeContent = {
  seo: {
    title: 'Vé Máy Bay Giá Tốt – Đặt Vé Nhanh Cùng Minh Việt Travel',
    description:
      'Tìm và đặt vé máy bay nội địa, quốc tế nhanh chóng cùng Minh Việt Travel. Hỗ trợ khách hàng tại Hải Phòng, tư vấn trực tiếp, giá minh bạch.',
    canonicalPath: '/ve-may-bay',
    ogImage: '/editorial-hero.webp',
  },

  hero: {
    eyebrow: 'Vé máy bay nội địa & quốc tế',
    headline: 'Vé Máy Bay Giá Tốt – Bay Khắp Việt Nam Cùng Minh Việt Travel',
    supportingCopy:
      'Tìm và đặt vé máy bay nội địa, quốc tế nhanh chóng, giá minh bạch. Đội ngũ Minh Việt tại Hải Phòng sẵn sàng tư vấn trực tiếp cho hành trình của bạn.',
    image: {
      src: '/editorial-hero.webp',
      alt: 'Bầu trời và cánh máy bay khi bay trên hành trình khám phá Việt Nam',
      width: 1920,
      height: 1080,
    },
  },

  searchBox: {
    airports,
    cabinClasses: [
      { value: 'economy', label: 'Phổ thông' },
      { value: 'premium_economy', label: 'Phổ thông đặc biệt' },
      { value: 'business', label: 'Thương gia' },
      { value: 'first', label: 'Hạng nhất' },
    ],
    defaultOriginCode: 'HPH',
    defaultDestinationCode: 'SGN',
  },

  flashSales: [
    {
      id: 'fs-hph-sgn',
      slug: 'bay-thang-hai-phong-tp-hcm',
      title: 'Bay thẳng Hải Phòng – TP.HCM',
      originCode: 'HPH',
      destinationCode: 'SGN',
      priceFrom: 990000,
      currency: 'VND',
      validUntil: '2026-08-31',
      image: { src: '/dest-vietnam.webp', alt: 'Phong cảnh Việt Nam từ trên cao', width: 1200, height: 900 },
      href: searchResultsHref('HPH', 'SGN'),
      order: 1,
      isActive: true,
    },
    {
      id: 'fs-hph-dad',
      slug: 'uu-dai-hai-phong-da-nang',
      title: 'Ưu đãi Hải Phòng – Đà Nẵng',
      originCode: 'HPH',
      destinationCode: 'DAD',
      priceFrom: 790000,
      currency: 'VND',
      validUntil: '2026-08-15',
      image: { src: '/ninh-binh.jpg', alt: 'Phong cảnh thiên nhiên miền Trung Việt Nam', width: 1200, height: 900 },
      href: searchResultsHref('HPH', 'DAD'),
      order: 2,
      isActive: true,
    },
    {
      id: 'fs-han-pqc',
      slug: 'san-ve-ha-noi-phu-quoc',
      title: 'Săn vé Hà Nội – Phú Quốc',
      originCode: 'HAN',
      destinationCode: 'PQC',
      priceFrom: 1290000,
      currency: 'VND',
      validUntil: '2026-09-10',
      image: { src: '/ha-long-bay.jpg', alt: 'Vịnh biển Việt Nam nhìn từ trên cao', width: 1200, height: 900 },
      href: searchResultsHref('HAN', 'PQC'),
      order: 3,
      isActive: true,
    },
    {
      id: 'fs-sgn-pqc',
      slug: 'khu-hoi-tp-hcm-phu-quoc',
      title: 'Khứ hồi TP.HCM – Phú Quốc',
      originCode: 'SGN',
      destinationCode: 'PQC',
      priceFrom: 690000,
      currency: 'VND',
      validUntil: '2026-08-20',
      image: { src: '/sapa-terraces.jpg', alt: 'Phong cảnh Việt Nam mùa hè', width: 1200, height: 900 },
      href: searchResultsHref('SGN', 'PQC'),
      order: 4,
      isActive: true,
    },
    {
      id: 'fs-hph-sin',
      slug: 'bay-quoc-te-singapore-khu-hoi',
      title: 'Bay quốc tế Singapore khứ hồi',
      originCode: 'HPH',
      destinationCode: 'SIN',
      priceFrom: 3490000,
      currency: 'VND',
      validUntil: '2026-09-30',
      image: { src: '/dest-singapore.webp', alt: 'Đường chân trời Singapore về đêm', width: 1200, height: 900 },
      href: searchResultsHref('HPH', 'SIN'),
      order: 5,
      isActive: true,
    },
    {
      id: 'fs-han-nrt',
      slug: 'bay-quoc-te-nhat-ban-khu-hoi',
      title: 'Bay quốc tế Nhật Bản khứ hồi',
      originCode: 'HAN',
      destinationCode: 'NRT',
      priceFrom: 6990000,
      currency: 'VND',
      validUntil: '2026-10-15',
      image: { src: '/dest-japan.webp', alt: 'Cảnh sắc mùa hoa anh đào tại Nhật Bản', width: 1200, height: 900 },
      href: searchResultsHref('HAN', 'NRT'),
      order: 6,
      isActive: true,
    },
  ],

  popularRoutes: [
    {
      id: 'route-hph-sgn',
      origin: airport('HPH'),
      destination: airport('SGN'),
      priceFrom: 990000,
      currency: 'VND',
      popularAirlines: ['Vietnam Airlines', 'Vietjet Air'],
      href: searchResultsHref('HPH', 'SGN'),
      order: 1,
      isActive: true,
    },
    {
      id: 'route-hph-dad',
      origin: airport('HPH'),
      destination: airport('DAD'),
      priceFrom: 790000,
      currency: 'VND',
      popularAirlines: ['Vietjet Air', 'Bamboo Airways'],
      href: searchResultsHref('HPH', 'DAD'),
      order: 2,
      isActive: true,
    },
    {
      id: 'route-hph-pqc',
      origin: airport('HPH'),
      destination: airport('PQC'),
      priceFrom: 1290000,
      currency: 'VND',
      popularAirlines: ['Vietnam Airlines', 'Vietjet Air'],
      href: searchResultsHref('HPH', 'PQC'),
      order: 3,
      isActive: true,
    },
    {
      id: 'route-han-dad',
      origin: airport('HAN'),
      destination: airport('DAD'),
      priceFrom: 690000,
      currency: 'VND',
      popularAirlines: ['Vietjet Air', 'Bamboo Airways', 'Vietravel Airlines'],
      href: searchResultsHref('HAN', 'DAD'),
      order: 4,
      isActive: true,
    },
    {
      id: 'route-han-cxr',
      origin: airport('HAN'),
      destination: airport('CXR'),
      priceFrom: 890000,
      currency: 'VND',
      popularAirlines: ['Vietnam Airlines', 'Vietjet Air'],
      href: searchResultsHref('HAN', 'CXR'),
      order: 5,
      isActive: true,
    },
    {
      id: 'route-sgn-pqc',
      origin: airport('SGN'),
      destination: airport('PQC'),
      priceFrom: 590000,
      currency: 'VND',
      popularAirlines: ['Vietjet Air', 'Vietravel Airlines'],
      href: searchResultsHref('SGN', 'PQC'),
      order: 6,
      isActive: true,
    },
  ],

  airlines: flightAirlines,

  articles: [
    {
      id: 'art-san-ve-re',
      slug: '5-meo-san-ve-may-bay-gia-re',
      title: '5 mẹo săn vé máy bay giá rẻ mùa cao điểm',
      excerpt: 'Đặt vé sớm bao lâu, khung giờ nào rẻ nhất và cách theo dõi biến động giá trước khi chốt chuyến bay.',
      image: { src: '/tour-bali.webp', alt: 'Hành khách chuẩn bị cho chuyến bay', width: 1200, height: 900 },
      publishedAt: '2026-07-20',
      href: '/cam-nang-bay/5-meo-san-ve-may-bay-gia-re',
      order: 1,
      isActive: true,
    },
    {
      id: 'art-thu-tuc-checkin',
      slug: 'huong-dan-check-in-tai-san-bay',
      title: 'Hướng dẫn làm thủ tục check-in tại sân bay từ A đến Z',
      excerpt: 'Check-in online, check-in tại quầy hay tự động — thời gian nên có mặt và giấy tờ cần chuẩn bị.',
      image: { src: '/tour-europe.webp', alt: 'Khu vực làm thủ tục tại sân bay', width: 1200, height: 900 },
      publishedAt: '2026-07-15',
      href: '/cam-nang-bay/huong-dan-check-in-tai-san-bay',
      order: 2,
      isActive: true,
    },
    {
      id: 'art-hanh-ly',
      slug: 'quy-dinh-hanh-ly-bay-noi-dia',
      title: 'Quy định hành lý xách tay và ký gửi khi bay nội địa',
      excerpt: 'Trọng lượng, kích thước cho phép và những vật dụng không được mang lên khoang hành khách.',
      image: { src: '/tour-korea.webp', alt: 'Hành lý xách tay chuẩn bị cho chuyến bay', width: 1200, height: 900 },
      publishedAt: '2026-07-08',
      href: '/cam-nang-bay/quy-dinh-hanh-ly-bay-noi-dia',
      order: 3,
      isActive: true,
    },
    {
      id: 'art-bay-tet',
      slug: 'kinh-nghiem-bay-tet',
      title: 'Kinh nghiệm bay Tết: đặt vé sớm, tránh trễ chuyến',
      excerpt: 'Cao điểm Tết luôn khan vé — lịch đặt vé lý tưởng và cách xử lý khi chuyến bay bị hoãn, hủy.',
      image: { src: '/tour-tokyo.webp', alt: 'Hành khách tại sân bay dịp cao điểm', width: 1200, height: 900 },
      publishedAt: '2026-06-28',
      href: '/cam-nang-bay/kinh-nghiem-bay-tet',
      order: 4,
      isActive: true,
    },
  ],

  faqs: [
    {
      id: 'faq-dat-ve',
      question: 'Làm sao để đặt vé máy bay tại Minh Việt Travel?',
      answer: 'Điền thông tin hành trình vào ô tìm kiếm phía trên hoặc gọi trực tiếp hotline 0934 368 132 — đội ngũ tư vấn sẽ báo giá và giữ chỗ cho bạn trong ngày.',
      order: 1,
      isActive: true,
    },
    {
      id: 'faq-doi-huy-ve',
      question: 'Tôi có thể đổi hoặc hủy vé sau khi đặt không?',
      answer: 'Có. Điều kiện đổi/hủy phụ thuộc vào hạng vé và chính sách của từng hãng bay — nhân viên tư vấn sẽ thông báo rõ trước khi bạn xác nhận thanh toán.',
      order: 2,
      isActive: true,
    },
    {
      id: 'faq-gia-ve',
      question: 'Giá vé hiển thị đã bao gồm thuế, phí chưa?',
      answer: 'Giá "từ" hiển thị trên trang là giá vé một chiều/hạng phổ thông đã bao gồm thuế, phí cơ bản, chưa gồm phụ phí hành lý hoặc dịch vụ chọn thêm (nếu có).',
      order: 3,
      isActive: true,
    },
    {
      id: 'faq-tre-em',
      question: 'Trẻ em và em bé có được tính giá vé riêng không?',
      answer: 'Có. Trẻ em (2–11 tuổi) và em bé (dưới 2 tuổi) áp dụng mức giá riêng theo quy định của từng hãng bay, thường thấp hơn giá vé người lớn.',
      order: 4,
      isActive: true,
    },
    {
      id: 'faq-thanh-toan',
      question: 'Tôi có thể thanh toán bằng những hình thức nào?',
      answer: 'Minh Việt hỗ trợ chuyển khoản, thanh toán tại văn phòng và các hình thức thanh toán trực tuyến phổ biến — chi tiết được tư vấn theo từng đơn đặt vé.',
      order: 5,
      isActive: true,
    },
    {
      id: 'faq-giay-to-quoc-te',
      question: 'Vé máy bay quốc tế cần chuẩn bị giấy tờ gì?',
      answer: 'Hộ chiếu còn hạn ít nhất 6 tháng và visa (nếu điểm đến yêu cầu) là bắt buộc — Minh Việt hỗ trợ tư vấn thêm về visa cho từng quốc gia.',
      order: 6,
      isActive: true,
    },
    {
      id: 'faq-ve-doan',
      question: 'Minh Việt có hỗ trợ đặt vé đoàn không?',
      answer: 'Có. Với đoàn từ 10 khách trở lên, Minh Việt hỗ trợ báo giá riêng, giữ chỗ theo lô và xuất hóa đơn tập trung cho doanh nghiệp.',
      order: 7,
      isActive: true,
    },
  ],

  finalCta: {
    headline: 'Đặt vé máy bay ngay hôm nay – Giá tốt, hỗ trợ tận tâm',
    description:
      'Chia sẻ hành trình mong muốn, đội ngũ Minh Việt Travel tại Hải Phòng sẽ tìm mức giá tốt nhất và đồng hành cùng bạn từ lúc đặt vé đến khi lên máy bay.',
    phone: '0934 368 132',
    primaryCta: { label: 'Tìm chuyến bay', href: '#tim-chuyen-bay' },
    secondaryCta: { label: 'Liên hệ tư vấn', href: '/contact' },
  },
}
