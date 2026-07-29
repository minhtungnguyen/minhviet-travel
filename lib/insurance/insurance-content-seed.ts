import type { InsuranceLandingContent, InsurancePlanSummary } from '@/types/insurance'
import { insurancePremiumTableSeed } from '@/lib/insurance/insurance-premium-table-seed'
import { insuranceBenefitTableSeed } from '@/lib/insurance/insurance-benefit-table-seed'

/**
 * Seed content for /insurance — DBV international travel insurance
 * add-on landing page. The only thing a real CMS integration needs to
 * replace; every section component depends only on `InsuranceLandingContent`
 * (via `lib/insurance/insurance-repository.ts`), never this file directly.
 *
 * TODO: Replace with CMS Provider — swap this literal object for a real
 * CMS/DB-backed fetch behind `getInsuranceLandingContent()` in
 * insurance-repository.ts; no component or route needs to change.
 *
 * Provider facts (name/hotline/website/legal basis), eligibility rules,
 * and plan letters (A/B/C) all come from
 * docs/insurance/Tờ rơi du lịch quốc tế DBV.pdf — do not alter without
 * re-checking that source.
 *
 * Hero image: reuses the real, existing `sapa-terraces.jpg` (already used
 * by lib/combo/combo-data-seed.ts) as a temporary placeholder — no
 * "family in an ordinary safe travel moment" photo (the brand-approved
 * subject for this module, BRAND-002 §Insurance) has been sourced yet.
 * Flip `isTemporaryAsset` to `false` in `insurance-hero.tsx` the same
 * commit a real photo is swapped in — same discipline as
 * attraction-ticket-hero.tsx's own temporary-asset flag.
 */

const PLANS: InsurancePlanSummary[] = [
  {
    code: 'A',
    name: 'Gói A',
    tagline: 'Bảo vệ cơ bản cho chuyến đi ngắn ngày',
    recommendedFor: 'Chuyến công tác, du lịch ngắn ngày trong khu vực',
  },
  {
    code: 'B',
    name: 'Gói B',
    tagline: 'Cân bằng giữa mức phí và quyền lợi',
    recommendedFor: 'Gia đình đi nghỉ dưỡng, du lịch nước ngoài dài ngày',
    isFeatured: true,
  },
  {
    code: 'C',
    name: 'Gói C',
    tagline: 'Quyền lợi cao nhất, bảo vệ toàn diện nhất',
    recommendedFor: 'Người thường xuyên di chuyển quốc tế, chuyến đi toàn cầu dài ngày',
  },
]

export const insuranceContentSeed: InsuranceLandingContent = {
  seo: {
    title: 'Bảo hiểm du lịch quốc tế DBV | Minh Việt Travel',
    description:
      'Bảo hiểm du lịch quốc tế DBV cho khách mua tour, visa, vé máy bay tại Minh Việt — quyền lợi đến 2,5 tỷ đồng, phí chỉ từ 140.000đ, hỗ trợ khẩn cấp 24/7.',
    canonicalPath: '/insurance',
    ogImage: '/images/hero/sapa-terraces.jpg',
  },
  hero: {
    eyebrow: 'Bảo hiểm du lịch quốc tế',
    headline: 'An tâm trọn hành trình cùng bảo hiểm du lịch quốc tế DBV',
    subheadline:
      'Đối tác bảo hiểm chính thức của Minh Việt Travel — quyền lợi bảo vệ đến 2.500.000.000 đồng, phí chỉ từ 140.000đ, hỗ trợ khẩn cấp 24/7 tại hơn 190 quốc gia.',
    heroImage: {
      src: '/images/hero/sapa-terraces.jpg',
      alt: 'Ruộng bậc thang Sa Pa vào mùa lúa chín',
      width: 1920,
      height: 1080,
    },
    primaryCta: { label: 'Tính phí bảo hiểm ngay', href: '#insurance-calculator' },
    secondaryCta: { label: 'Liên hệ tư vấn', href: '#insurance-form' },
    trustSignals: [
      'Quyền lợi lên đến 2.500.000.000 đồng',
      'Phí chỉ từ 140.000 đồng/người',
      'Hợp lệ xin visa quốc tế',
      'Hỗ trợ khẩn cấp 24/7',
    ],
  },
  whyBuy: {
    eyebrow: 'Vì sao nên mua',
    title: 'Vì sao nên mua bảo hiểm du lịch trước khi lên đường',
    description:
      'Một sự cố y tế hay hành lý thất lạc ở nước ngoài có thể tốn kém gấp nhiều lần chi phí bảo hiểm — DBV đồng hành để bạn an tâm tận hưởng chuyến đi.',
    items: [
      {
        id: 'medical-cost',
        icon: 'shield-check',
        title: 'Giảm rủi ro tài chính khi có sự cố y tế',
        description: 'Chi phí khám chữa bệnh ở nước ngoài thường cao hơn nhiều lần so với trong nước — quyền lợi y tế lên đến 100.000 USD giúp bạn không phải tự chi trả toàn bộ.',
      },
      {
        id: 'visa-requirement',
        icon: 'file-check-2',
        title: 'Đáp ứng yêu cầu hồ sơ visa quốc tế',
        description: 'Nhiều Đại sứ quán (đặc biệt khối Schengen) yêu cầu bảo hiểm du lịch còn hiệu lực khi nộp hồ sơ xin visa — chứng nhận bảo hiểm DBV được chấp nhận rộng rãi.',
      },
      {
        id: 'trip-disruption',
        icon: 'plane',
        title: 'Bảo vệ trước sự cố hủy/hoãn chuyến, thất lạc hành lý',
        description: 'Từ hoãn chuyến bay, lỡ nối chuyến đến hành lý thất lạc — các chi phí phát sinh ngoài kế hoạch được bù đắp theo quyền lợi hợp đồng.',
      },
      {
        id: 'assistance-247',
        icon: 'phone-call',
        title: 'Hỗ trợ khẩn cấp 24/7 mọi nơi trên thế giới',
        description: 'Tổng đài hỗ trợ khẩn cấp của DBV luôn sẵn sàng khi bạn cần tư vấn y tế, thu xếp bệnh viện hoặc hỗ trợ khẩn cấp khác ở nước ngoài.',
      },
    ],
  },
  eligibility: {
    minAgeWeeks: 6,
    maxAgeYears: 75,
    maxTripDays: 180,
    notes: [
      'Áp dụng cho công dân Việt Nam và người nước ngoài cư trú hợp pháp tại Việt Nam.',
      'Trẻ em dưới 10 tuổi phải được một người trưởng thành đi kèm và được bảo hiểm trong cùng một hợp đồng.',
      'Áp dụng cho cá nhân, gia đình, tổ chức và khách theo tour.',
      'Phí bảo hiểm gia đình = phí bảo hiểm cá nhân × (số người trong gia đình − 1); gói gia đình chỉ gồm bố, mẹ và các con hợp pháp.',
    ],
  },
  plans: PLANS,
  benefitRows: insuranceBenefitTableSeed,
  premiumRates: insurancePremiumTableSeed,
  faqs: [
    {
      id: 'coverage-scope',
      question: 'Bảo hiểm du lịch quốc tế DBV chi trả những gì?',
      answer:
        'Bảo hiểm chi trả chi phí y tế ở nước ngoài (nội trú, ngoại trú, thai sản, Covid-19), vận chuyển y tế khẩn cấp, hồi hương, tử vong/thương tật do tai nạn, hủy/hoãn chuyến đi, thất lạc hành lý và nhiều quyền lợi khác — xem chi tiết tại bảng quyền lợi và bảng so sánh gói trên trang này.',
      order: 1,
      isActive: true,
    },
    {
      id: 'which-plan',
      question: 'Nên chọn gói A, B hay C?',
      answer:
        'Gói A phù hợp chuyến đi ngắn ngày, ngân sách tiết kiệm. Gói B cân bằng giữa phí và quyền lợi, phù hợp phần lớn chuyến du lịch/công tác. Gói C có quyền lợi cao nhất, phù hợp người thường xuyên đi công tác quốc tế hoặc chuyến đi dài ngày. Dùng Form tính phí trên trang này để so sánh phí thực tế theo hành trình của bạn.',
      order: 2,
      isActive: true,
    },
    {
      id: 'visa-application',
      question: 'Bảo hiểm này có dùng để xin visa được không?',
      answer:
        'Có. Chứng nhận bảo hiểm du lịch quốc tế DBV hợp lệ để nộp kèm hồ sơ xin visa quốc tế tại phần lớn Đại sứ quán/Lãnh sự quán, bao gồm khối Schengen.',
      order: 3,
      isActive: true,
    },
    {
      id: 'family-premium',
      question: 'Phí bảo hiểm cho gia đình tính như thế nào?',
      answer:
        'Phí bảo hiểm gia đình = phí bảo hiểm cá nhân × (số người trong gia đình − 1). Gói gia đình chỉ áp dụng cho các thành viên là bố, mẹ và các con hợp pháp — không áp dụng cho nhóm bạn bè hay đồng nghiệp.',
      order: 4,
      isActive: true,
    },
    {
      id: 'claim-process',
      question: 'Nếu cần bồi thường thì liên hệ ai và cần giấy tờ gì?',
      answer:
        'Gọi ngay tổng đài CSKH DBV 1900 96 96 90 để được hướng dẫn khi có sự cố ở nước ngoài. Hồ sơ yêu cầu bồi thường thường gồm: hóa đơn/biên lai chi phí gốc, hồ sơ bệnh án hoặc biên bản sự việc (công an, hãng bay, khách sạn tùy trường hợp), bản sao hợp đồng bảo hiểm và giấy tờ tùy thân.',
      order: 5,
      isActive: true,
    },
    {
      id: 'how-to-buy',
      question: 'Làm sao để mua bảo hiểm qua Minh Việt Travel?',
      answer:
        'Dùng Form tính phí trên trang này để ước tính chi phí theo hành trình, sau đó bấm "Mua ngay" hoặc "Liên hệ tư vấn" để gửi yêu cầu — chuyên viên Minh Việt sẽ liên hệ xác nhận thông tin và hoàn tất hợp đồng cùng bạn.',
      order: 6,
      isActive: true,
    },
  ],
  finalCta: {
    headline: 'Đừng để rủi ro làm gián đoạn chuyến đi của bạn',
    description: 'Chỉ mất 2 phút để tính phí và gửi yêu cầu tư vấn — đội ngũ Minh Việt Travel sẽ hỗ trợ bạn hoàn tất bảo hiểm trước ngày khởi hành.',
    primaryCta: { label: 'Tính phí bảo hiểm ngay', href: '#insurance-calculator' },
    secondaryCta: { label: 'Liên hệ tư vấn', href: '#insurance-form' },
  },
  provider: {
    name: 'Tập đoàn Bảo hiểm DBV',
    hotline: '1900 96 96 90',
    website: 'https://dbvi.com.vn',
    legalBasis: 'Quyết định số 106/QĐ/2008-VNI/BHCN ngày 23/09/2008 của DBV và các điều khoản bổ sung/mở rộng tại chương trình bảo hiểm chi tiết',
  },
}
