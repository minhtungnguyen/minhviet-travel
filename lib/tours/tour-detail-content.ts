import { z } from 'zod'
import type { AvailabilityStatus, PriceType } from '@/types/cms'

/**
 * Extended content for the Tour Detail page only (gallery, itinerary,
 * inclusions/exclusions, availability, policy). Deliberately kept out of
 * `lib/site-data.ts` — that file also feeds `/tours` and `TourCard`, which
 * are out of scope for this task — and out of `lib/cms/*`, which is the
 * homepage's own content seam. Keyed by the same `Tour.id` used in
 * `lib/site-data.ts` so the detail page can merge the two.
 *
 * `availability`/`priceType` reuse the same honest vocabulary already
 * established for the homepage (`types/cms.ts`) instead of the legacy
 * `Tour.seats` seat-counter / `Tour.discount` crossed-out-price pattern —
 * see PROJECT_AUDIT.md §3.2 "Giá gạch ngang... mô hình OTA giá rẻ".
 */

const itineraryDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
})

const cancellationTierSchema = z.object({
  label: z.string().min(1),
  detail: z.string().min(1),
})

const tourDetailContentSchema = z.object({
  gallery: z.array(z.object({ src: z.string().min(1), alt: z.string().min(1) })).min(1),
  availability: z.enum(['open', 'limited', 'almost-full', 'closed', 'pending-confirmation']),
  priceType: z.enum(['estimate', 'confirmed']),
  itinerary: z.array(itineraryDaySchema).min(1),
  inclusions: z.array(z.string().min(1)).min(1),
  exclusions: z.array(z.string().min(1)).min(1),
})

export type ItineraryDay = z.infer<typeof itineraryDaySchema>
export type CancellationTier = z.infer<typeof cancellationTierSchema>
export type GalleryImage = { src: string; alt: string }
export type TourDetailContent = {
  gallery: GalleryImage[]
  availability: AvailabilityStatus
  priceType: PriceType
  itinerary: ItineraryDay[]
  inclusions: string[]
  exclusions: string[]
}

const INTERNATIONAL_INCLUSIONS = [
  'Vé máy bay khứ hồi theo đoàn (hạng phổ thông)',
  'Khách sạn tiêu chuẩn 4 sao (phòng đôi/twin)',
  'Các bữa ăn theo chương trình',
  'Xe du lịch đời mới đưa đón theo lịch trình',
  'Hướng dẫn viên tiếng Việt suốt tuyến',
  'Vé tham quan theo chương trình',
  'Bảo hiểm du lịch quốc tế',
]

const INTERNATIONAL_EXCLUSIONS = [
  'Chi phí cá nhân (giặt ủi, điện thoại, đồ uống ngoài bữa chính...)',
  'Phụ thu phòng đơn (nếu có yêu cầu)',
  'Tiền tip hướng dẫn viên và tài xế địa phương',
  'Chi phí phát sinh do sự kiện bất khả kháng (thời tiết, an ninh, dịch bệnh...)',
]

const DOMESTIC_INCLUSIONS = [
  'Vé máy bay khứ hồi theo chương trình',
  'Khách sạn/resort tiêu chuẩn 3–4 sao',
  'Các bữa ăn theo chương trình',
  'Xe đưa đón và tàu/cáp treo theo lịch trình',
  'Hướng dẫn viên suốt tuyến',
  'Vé tham quan theo chương trình',
  'Bảo hiểm du lịch',
]

const DOMESTIC_EXCLUSIONS = [
  'Chi phí cá nhân ngoài chương trình',
  'Phụ thu phòng đơn (nếu có yêu cầu)',
  'Tiền tip hướng dẫn viên, tài xế',
  'Vé các trò chơi/trải nghiệm tự chọn ngoài chương trình chính',
]

/** Company-wide payment terms — not per-tour, so kept as one shared block. */
export const standardPaymentPolicy: string[] = [
  'Đặt cọc 30% giá trị chương trình ngay khi đăng ký để giữ chỗ.',
  'Thanh toán đủ 100% chậm nhất 15 ngày trước ngày khởi hành.',
  'Đặt cọc và thanh toán được xác nhận bằng phiếu thu hoặc hợp đồng dịch vụ chính thức từ Minh Việt Travel.',
  'Giá có thể điều chỉnh khi tỷ giá, thuế hoặc phụ phí nhiên liệu biến động — mọi thay đổi được thông báo trước khi xuất vé/xác nhận dịch vụ.',
]

/** Company-wide cancellation tiers — not per-tour, so kept as one shared block. */
export const standardCancellationPolicy: CancellationTier[] = [
  { label: 'Trước 30 ngày khởi hành', detail: 'Hoàn 90% (giữ lại 10% phí xử lý)' },
  { label: '15 – 29 ngày', detail: 'Hoàn 50%' },
  { label: '7 – 14 ngày', detail: 'Hoàn 30%' },
  { label: 'Dưới 7 ngày hoặc không khởi hành', detail: 'Không hoàn tiền cọc' },
]

export const cancellationPolicyNote =
  'Chính sách áp dụng cho trường hợp huỷ từ phía khách hàng. Trường hợp bất khả kháng (thiên tai, dịch bệnh, chính sách nhà nước...) được xử lý theo thoả thuận cụ thể với chuyên viên phụ trách.'

z.array(cancellationTierSchema).parse(standardCancellationPolicy)

const rawTourDetailContent: Record<string, TourDetailContent> = {
  tokyo: {
    gallery: [
      { src: '/tour-tokyo.webp', alt: 'Núi Phú Sĩ nhìn từ hồ Kawaguchiko, Nhật Bản' },
      { src: '/dest-japan.webp', alt: 'Cổng torii Fushimi Inari, Kyoto, Nhật Bản' },
    ],
    availability: 'limited',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'Hà Nội – Tokyo', description: 'Khởi hành từ Hà Nội, nhận phòng khách sạn tại Tokyo, tự do nghỉ ngơi.' },
      { day: 2, title: 'Tokyo – Asakusa – Odaiba', description: 'Tham quan chùa Senso-ji, phố cổ Asakusa, cầu Rainbow và khu Odaiba.' },
      { day: 3, title: 'Núi Phú Sĩ – Kawaguchiko', description: 'Di chuyển tới hồ Kawaguchiko ngắm núi Phú Sĩ, trải nghiệm onsen truyền thống.' },
      { day: 4, title: 'Hakone – Hồ Ashi', description: 'Tham quan Hakone, đi tàu ngắm cảnh hồ Ashi, trở về Tokyo buổi tối.' },
      { day: 5, title: 'Tokyo – Hà Nội', description: 'Tự do mua sắm tại Shinjuku, ra sân bay về lại Hà Nội.' },
    ],
    inclusions: INTERNATIONAL_INCLUSIONS,
    exclusions: INTERNATIONAL_EXCLUSIONS,
  },
  korea: {
    gallery: [{ src: '/tour-korea.webp', alt: 'Đảo Nami mùa thu, Hàn Quốc' }],
    availability: 'open',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'Hà Nội – Seoul', description: 'Khởi hành đi Seoul, nhận phòng khách sạn.' },
      { day: 2, title: 'Đảo Nami – Petite France', description: 'Tham quan đảo Nami mùa thu và làng Petite France.' },
      { day: 3, title: 'Công viên Everland', description: 'Trải nghiệm công viên giải trí lớn nhất Hàn Quốc.' },
      { day: 4, title: 'Seoul – Gyeongbokgung – Myeongdong', description: 'Tham quan cung điện Gyeongbokgung, mua sắm tại Myeongdong.' },
      { day: 5, title: 'Seoul – Hà Nội', description: 'Tự do nghỉ ngơi, ra sân bay về lại Hà Nội.' },
    ],
    inclusions: INTERNATIONAL_INCLUSIONS,
    exclusions: INTERNATIONAL_EXCLUSIONS,
  },
  europe: {
    gallery: [{ src: '/tour-europe.webp', alt: 'Dãy núi Alps Thụy Sĩ nhìn từ Titlis' }],
    availability: 'limited',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'TP.HCM – Zurich', description: 'Khởi hành đi Zurich (bay đêm).' },
      { day: 2, title: 'Zurich – Lucerne – Titlis', description: 'Tham quan Lucerne, lên đỉnh Titlis bằng cáp treo xoay Rotair.' },
      { day: 3, title: 'Lucerne – Interlaken – Grindelwald', description: 'Khám phá thung lũng Grindelwald và thị trấn Interlaken.' },
      { day: 4, title: 'Interlaken – Milan', description: 'Di chuyển sang Milan, tham quan quảng trường Duomo.' },
      { day: 5, title: 'Milan – Venice', description: 'Dạo thuyền gondola trên kênh đào Venice.' },
      { day: 6, title: 'Venice – Florence', description: 'Tham quan quảng trường Signoria và cầu Ponte Vecchio.' },
      { day: 7, title: 'Florence – Rome', description: 'Tham quan đấu trường Colosseum và đền Pantheon.' },
      { day: 8, title: 'Rome – Vatican', description: 'Tham quan Vatican, tự do mua sắm.' },
      { day: 9, title: 'Rome – TP.HCM', description: 'Ra sân bay, bay về TP.HCM.' },
    ],
    inclusions: [...INTERNATIONAL_INCLUSIONS, 'Hỗ trợ hồ sơ xin visa Schengen'],
    exclusions: [...INTERNATIONAL_EXCLUSIONS, 'Phí xin visa Schengen (được hỗ trợ hồ sơ, không bao gồm lệ phí)'],
  },
  bali: {
    gallery: [{ src: '/tour-bali.webp', alt: 'Ruộng bậc thang Tegalalang, Bali, Indonesia' }],
    availability: 'open',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'TP.HCM – Denpasar', description: 'Khởi hành đi Denpasar, nhận phòng resort.' },
      { day: 2, title: 'Đền Uluwatu – Bãi biển Kuta', description: 'Tham quan đền Uluwatu, xem múa Kecak, dạo biển Kuta.' },
      { day: 3, title: 'Ubud – Ruộng bậc thang', description: 'Tham quan ruộng bậc thang Tegalalang và rừng khỉ thiêng Ubud.' },
      { day: 4, title: 'Denpasar – TP.HCM', description: 'Tự do tắm biển buổi sáng, ra sân bay về TP.HCM.' },
    ],
    inclusions: INTERNATIONAL_INCLUSIONS,
    exclusions: INTERNATIONAL_EXCLUSIONS,
  },
  phuquoc: {
    gallery: [{ src: '/dest-vietnam.webp', alt: 'Phong cảnh Việt Nam' }],
    availability: 'almost-full',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'TP.HCM – Phú Quốc', description: 'Bay tới Phú Quốc, trải nghiệm cáp treo Hòn Thơm.' },
      { day: 2, title: 'Nam Đảo – Grand World', description: 'Tham quan Nam Đảo, khu vui chơi Grand World (vé trò chơi tự chọn).' },
      { day: 3, title: 'Chợ đêm Dinh Cậu – TP.HCM', description: 'Tự do tham quan chợ đêm Dinh Cậu, ra sân bay về TP.HCM.' },
    ],
    inclusions: DOMESTIC_INCLUSIONS,
    exclusions: DOMESTIC_EXCLUSIONS,
  },
  singapore: {
    gallery: [{ src: '/dest-singapore.webp', alt: 'Vịnh Marina Bay về đêm, Singapore' }],
    availability: 'open',
    priceType: 'estimate',
    itinerary: [
      { day: 1, title: 'Hà Nội – Singapore', description: 'Khởi hành đi Singapore, tham quan khu vực Marina Bay.' },
      { day: 2, title: 'Đảo Sentosa', description: 'Khám phá đảo Sentosa (vé Universal Studios tự chọn).' },
      { day: 3, title: 'Gardens by the Bay – Little India', description: 'Tham quan Gardens by the Bay, khu phố Tàu và Little India.' },
      { day: 4, title: 'Orchard Road – Về nước', description: 'Tự do mua sắm Orchard Road, ra sân bay về nước.' },
    ],
    inclusions: INTERNATIONAL_INCLUSIONS,
    exclusions: INTERNATIONAL_EXCLUSIONS,
  },
}

Object.values(rawTourDetailContent).forEach((content) => tourDetailContentSchema.parse(content))

export function getTourDetailContent(id: string): TourDetailContent | undefined {
  return rawTourDetailContent[id]
}
