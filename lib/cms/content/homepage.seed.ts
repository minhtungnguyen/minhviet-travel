import type { HomepageContent } from '@/types/homepage'

/**
 * Local seed content conforming exactly to `HomepageContent`. This is the
 * thing a real CMS integration replaces — every section component reads
 * only from the typed contract in `types/homepage.ts`, never from this
 * file directly, so swapping the fetch implementation in
 * `lib/cms/client.ts` is the only change a future CMS migration needs.
 *
 * Every number shown as proof carries a `source`/`asOf` pair. Nothing
 * here uses fabricated ratings, invented seat counters, or countdown
 * urgency — see the approved Design Audit, section 8 (Trust Signals).
 */
export const homepageContentSeed: HomepageContent = {
  hero: {
    eyebrow: 'Minh Việt Travel · Enterprise Travel & MICE',
    headline: 'Kiến tạo hành trình, nâng tầm trải nghiệm',
    headlineAccent: 'doanh nghiệp',
    subhead:
      'Giải pháp du lịch, sự kiện và công tác trọn gói dành cho doanh nghiệp, tổ chức và khách hàng cao cấp — thẩm định bởi chuyên gia, hỗ trợ bởi AI.',
    primaryCta: { label: 'Thiết kế chương trình riêng', href: '/tour-thiet-ke' },
    secondaryCta: { label: 'Khám phá tour có sẵn', href: '#tour-ghep-quoc-te' },
    backgroundImage: {
      src: '/editorial-hero.webp',
      alt: 'Du khách ngắm bình minh trên thung lũng núi đá vôi Việt Nam',
      width: 1920,
      height: 1080,
    },
    proofStat: {
      id: 'years-experience',
      value: 5,
      suffix: '+',
      label: 'Năm kinh nghiệm triển khai MICE',
      source: 'Hồ sơ năng lực Minh Việt Travel',
      asOf: '2026',
    },
  },
  trustStrip: {
    eyebrow: 'Được tin dùng bởi doanh nghiệp & tổ chức trên cả nước',
    positioning: {
      headline: 'Minh Việt không chỉ bán tour — Minh Việt thiết kế và tổ chức toàn bộ hành trình.',
      description:
        'Đội ngũ chuyên trách thiết kế chương trình riêng cho tour doanh nghiệp, MICE, hội nghị và tour gia đình — song song phân phối tour ghép quốc tế, vé máy bay, du thuyền, khách sạn, vé vui chơi, visa và bảo hiểm cho khách cần dịch vụ có sẵn.',
    },
    segments: [
      { id: 'fdi', label: 'Khu công nghiệp & FDI', icon: 'building' },
      { id: 'gov', label: 'Cơ quan nhà nước', icon: 'landmark' },
      { id: 'association', label: 'Hiệp hội & tổ chức', icon: 'users' },
      { id: 'corporate', label: 'Corporate travel', icon: 'briefcase' },
    ],
    stats: [
      {
        id: 'clients-served',
        value: 200,
        suffix: '+',
        label: 'Doanh nghiệp đã tin dùng',
        source: 'CRM nội bộ Minh Việt, tổng lũy kế',
        asOf: '2026-Q2',
      },
      {
        id: 'travelers-served',
        value: 10,
        suffix: 'K+',
        label: 'Lượt khách được phục vụ',
        source: 'Báo cáo vận hành nội bộ',
        asOf: '2026-Q2',
      },
      {
        id: 'global-partners',
        value: 150,
        suffix: '+',
        label: 'Đối tác lưu trú, vận chuyển',
        source: 'Danh mục đối tác Minh Việt',
        asOf: '2026-Q2',
      },
    ],
    partners: [
      { id: 'vietnam-airlines', name: 'Vietnam Airlines', category: 'airline' },
      { id: 'singapore-airlines', name: 'Singapore Airlines', category: 'airline' },
      { id: 'korean-air', name: 'Korean Air', category: 'airline' },
      { id: 'ana', name: 'ANA', category: 'airline' },
      { id: 'marriott', name: 'Marriott', category: 'hotel' },
      { id: 'accor', name: 'Accor', category: 'hotel' },
      { id: 'intercontinental', name: 'InterContinental', category: 'hotel' },
      { id: 'vinpearl', name: 'Vinpearl', category: 'hotel' },
    ],
  },
  coreServices: {
    eyebrow: 'Dịch vụ cốt lõi',
    title: 'Một đầu mối, trọn vẹn hành trình',
    groups: [
      {
        id: 'bespoke',
        label: 'Thiết kế theo yêu cầu',
        services: [
          { id: 'group-tours', title: 'Tour đoàn', icon: 'group', href: '/tours?type=group' },
          { id: 'mice', title: 'MICE & Sự kiện', icon: 'briefcase', href: '/mice' },
        ],
      },
      {
        id: 'ready-made',
        label: 'Có sẵn — khám phá ngay',
        services: [
          { id: 'flights', title: 'Vé máy bay', icon: 'plane', href: '/flights' },
          { id: 'hotels', title: 'Khách sạn', icon: 'building', href: '/hotels' },
          { id: 'tour-ghep-quoc-te', title: 'Tour ghép Quốc tế', icon: 'globe', href: '#tour-ghep-quoc-te' },
          { id: 'cruises', title: 'Du thuyền', icon: 'ship', href: '/cruises' },
          { id: 'tickets', title: 'Vé vui chơi', icon: 'ticket', href: '/tickets' },
          { id: 'custom-service', title: 'Dịch vụ lẻ', icon: 'sparkles', href: '/services' },
        ],
      },
    ],
  },
  enterpriseMice: {
    badge: 'Giải pháp doanh nghiệp & MICE',
    title: 'Sự kiện đẳng cấp cho doanh nghiệp của bạn',
    description:
      'Hội nghị, team building, gala dinner và incentive — dàn dựng trọn gói, chuyên nghiệp, đạt tiêu chuẩn doanh nghiệp và tổ chức quốc tế.',
    story:
      'Từ tiếp nhận yêu cầu đến nghiệm thu sau sự kiện, một đội điều phối duy nhất đồng hành cùng doanh nghiệp qua từng bước — không bàn giao giữa chừng, không phát sinh đầu mối thứ hai.',
    process: [
      'Tiếp nhận yêu cầu',
      'Lên Concept',
      'Thiết kế chương trình',
      'Điều phối',
      'Vận hành',
      'Nghiệm thu',
    ],
    proofStat: {
      id: 'mice-programs-delivered',
      value: 30,
      suffix: '+',
      label: 'Chương trình MICE đã triển khai',
      source: 'Báo cáo vận hành nội bộ Minh Việt',
      asOf: '2026-Q2',
    },
    image: {
      src: '/mice-audience-vietnam.jpg',
      alt: 'Khán phòng sự kiện doanh nghiệp do Minh Việt tổ chức, khách mời vỗ tay hưởng ứng',
      width: 1600,
      height: 1067,
    },
    cta: { label: 'Yêu cầu thiết kế chương trình', href: '/mice' },
  },
  aiAdvisor: {
    eyebrow: 'Công nghệ & con người',
    title: 'Trợ lý AI, thẩm định bởi',
    titleAccent: 'chuyên gia thật',
    description:
      'Chọn ngân sách, quy mô đoàn và ưu tiên điểm đến — AI của Minh Việt đề xuất hành trình phù hợp kèm mức độ phù hợp và lý do cụ thể. Chuyên viên xác nhận trước khi triển khai.',
    disclosureNote:
      'Đây là gợi ý từ AI dựa trên dữ liệu bạn cung cấp, chưa phải xác nhận cuối cùng — chuyên viên Minh Việt sẽ liên hệ để xác nhận tính khả thi trước khi triển khai.',
    questions: [
      {
        id: 'budget',
        label: 'Ngân sách dự kiến',
        placeholder: 'Chọn mức ngân sách',
        options: [
          { value: 'under-15tr', label: 'Dưới 15 triệu / người' },
          { value: '15-30tr', label: '15 - 30 triệu / người' },
          { value: '30-70tr', label: '30 - 70 triệu / người' },
          { value: '70tr-plus', label: 'Trên 70 triệu / người' },
        ],
      },
      {
        id: 'groupSize',
        label: 'Quy mô đoàn',
        placeholder: 'Chọn quy mô',
        options: [
          { value: 'individual', label: 'Cá nhân / cặp đôi' },
          { value: 'small-group', label: 'Nhóm nhỏ (dưới 10 người)' },
          { value: 'large-group', label: 'Đoàn lớn (10 - 50 người)' },
          { value: 'corporate', label: 'Doanh nghiệp / tổ chức (50+ người)' },
        ],
      },
      {
        id: 'preference',
        label: 'Ưu tiên điểm đến',
        placeholder: 'Chọn ưu tiên',
        options: [
          { value: 'beach', label: 'Biển & nghỉ dưỡng' },
          { value: 'mountain', label: 'Núi & thiên nhiên' },
          { value: 'culture', label: 'Văn hoá & di sản' },
          { value: 'city', label: 'Đô thị & hiện đại' },
        ],
      },
    ],
    humanHandoffCta: { label: 'Nói chuyện với chuyên viên', href: '/contact?intent=ai-advisor' },
  },
  ceoSection: {
    eyebrow: 'Thông điệp lãnh đạo',
    quote: '',
    name: '',
    title: '',
    portrait: null,
  },
  featuredJourneys: {
    eyebrow: 'Tour ghép quốc tế',
    title: 'Khởi hành định kỳ,',
    titleAccent: 'ghép đoàn theo lịch có sẵn',
    filters: [
      { id: 'all', label: 'Tất cả' },
      { id: 'asia', label: 'Châu Á' },
      { id: 'europe', label: 'Châu Âu' },
      { id: 'domestic', label: 'Nội địa' },
    ],
    journeys: [
      {
        id: 'tokyo',
        title: 'Tokyo — Núi Phú Sĩ — Hakone',
        country: 'Nhật Bản',
        category: 'asia',
        duration: '5N4Đ',
        priceFrom: 27900000,
        priceType: 'estimate',
        currency: 'VND',
        departures: [
          {
            id: 'tokyo-2026-08-15',
            tourId: 'tokyo',
            departureDate: '2026-08-15',
            departurePoint: 'Hà Nội',
            availabilityStatus: 'AVAILABLE',
            capacity: 20,
            bookedSeats: 8,
            availableSeats: 12,
            saleOpenAt: '2026-05-01',
            saleCloseAt: '2026-08-10',
            price: 27900000,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/tour-tokyo.webp', alt: 'Tokyo và núi Phú Sĩ', width: 800, height: 600 },
        href: '/tour/tokyo',
        matchTags: ['budget:15-30tr', 'group:individual', 'group:small-group', 'preference:culture', 'preference:mountain'],
      },
      {
        id: 'korea',
        title: 'Seoul — Nami — Everland mùa thu',
        country: 'Hàn Quốc',
        category: 'asia',
        duration: '5N4Đ',
        priceFrom: 16900000,
        priceType: 'estimate',
        currency: 'VND',
        // Raw status is AVAILABLE, but real seat data (3, at/under the
        // configured threshold of 5) promotes this to LIMITED — see
        // `deriveDepartureAvailability` in lib/tours/availability.ts.
        departures: [
          {
            id: 'korea-2026-08-18',
            tourId: 'korea',
            departureDate: '2026-08-18',
            departurePoint: 'Hà Nội',
            availabilityStatus: 'AVAILABLE',
            capacity: 20,
            bookedSeats: 17,
            availableSeats: 3,
            saleOpenAt: '2026-05-01',
            saleCloseAt: '2026-08-13',
            price: 16900000,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/tour-korea.webp', alt: 'Seoul và đảo Nami', width: 800, height: 600 },
        href: '/tour/korea',
        matchTags: ['budget:under-15tr', 'budget:15-30tr', 'group:individual', 'group:small-group', 'preference:city', 'preference:mountain'],
      },
      {
        id: 'europe',
        title: 'Thụy Sĩ — Pháp — Ý cao cấp',
        country: 'Châu Âu',
        category: 'europe',
        duration: '9N8Đ',
        priceFrom: 64900000,
        priceType: 'estimate',
        currency: 'VND',
        // Seat/status data not confirmed yet for this departure — an
        // honest CHECKING state, not a guessed AVAILABLE.
        departures: [
          {
            id: 'europe-2026-08-02',
            tourId: 'europe',
            departureDate: '2026-08-02',
            departurePoint: 'TP. Hồ Chí Minh',
            availabilityStatus: null,
            capacity: 16,
            bookedSeats: null,
            availableSeats: null,
            saleOpenAt: '2026-05-01',
            saleCloseAt: null,
            price: null,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/tour-europe.webp', alt: 'Thụy Sĩ, Pháp, Ý', width: 800, height: 600 },
        href: '/tour/europe',
        matchTags: ['budget:30-70tr', 'budget:70tr-plus', 'group:small-group', 'group:corporate', 'preference:culture', 'preference:city'],
      },
      {
        id: 'bali',
        title: 'Bali — Thiên đường nghỉ dưỡng',
        country: 'Indonesia',
        category: 'asia',
        duration: '4N3Đ',
        priceFrom: 13900000,
        priceType: 'estimate',
        currency: 'VND',
        departures: [
          {
            id: 'bali-2026-07-30',
            tourId: 'bali',
            departureDate: '2026-07-30',
            departurePoint: 'TP. Hồ Chí Minh',
            availabilityStatus: 'AVAILABLE',
            capacity: 15,
            bookedSeats: 6,
            availableSeats: 9,
            saleOpenAt: '2026-05-01',
            saleCloseAt: '2026-07-26',
            price: 13900000,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/tour-bali.webp', alt: 'Bali nghỉ dưỡng', width: 800, height: 600 },
        href: '/tour/bali',
        matchTags: ['budget:under-15tr', 'group:individual', 'group:small-group', 'preference:beach'],
      },
      {
        id: 'phuquoc',
        title: 'Phú Quốc — Nam Đảo — Hòn Thơm',
        country: 'Việt Nam',
        category: 'domestic',
        duration: '3N2Đ',
        priceFrom: 4990000,
        priceType: 'estimate',
        currency: 'VND',
        // The 07-10 departure is in the past relative to "today" and is
        // correctly ignored by selectPrimaryDeparture(); both real
        // upcoming dates are sold out, so the card surfaces the sooner
        // one (07-28) with an honest "Hết chỗ" / "Xem lịch khác" — not
        // silently falling back to the past date's AVAILABLE status.
        departures: [
          {
            id: 'phuquoc-2026-07-10',
            tourId: 'phuquoc',
            departureDate: '2026-07-10',
            departurePoint: 'TP. Hồ Chí Minh',
            availabilityStatus: 'AVAILABLE',
            capacity: 30,
            bookedSeats: 12,
            availableSeats: 18,
            saleOpenAt: '2026-04-01',
            saleCloseAt: '2026-07-05',
            price: 4990000,
            currency: 'VND',
            isActive: true,
          },
          {
            id: 'phuquoc-2026-08-01',
            tourId: 'phuquoc',
            departureDate: '2026-08-01',
            departurePoint: 'TP. Hồ Chí Minh',
            availabilityStatus: 'SOLD_OUT',
            capacity: 30,
            bookedSeats: 30,
            availableSeats: 0,
            saleOpenAt: '2026-04-01',
            saleCloseAt: '2026-07-28',
            price: 4990000,
            currency: 'VND',
            isActive: true,
          },
          {
            id: 'phuquoc-2026-08-22',
            tourId: 'phuquoc',
            departureDate: '2026-08-22',
            departurePoint: 'TP. Hồ Chí Minh',
            availabilityStatus: 'SOLD_OUT',
            capacity: 30,
            bookedSeats: 30,
            availableSeats: 0,
            saleOpenAt: '2026-04-01',
            saleCloseAt: '2026-08-18',
            price: 4990000,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/dest-vietnam.webp', alt: 'Phú Quốc, Việt Nam', width: 800, height: 600 },
        href: '/tour/phuquoc',
        matchTags: ['budget:under-15tr', 'group:individual', 'group:small-group', 'group:large-group', 'preference:beach'],
      },
      {
        id: 'singapore',
        title: 'Singapore — Sentosa — Gardens by the Bay',
        country: 'Singapore',
        category: 'asia',
        duration: '4N3Đ',
        priceFrom: 12900000,
        priceType: 'estimate',
        currency: 'VND',
        // Raw status is still AVAILABLE in the record, but its sale
        // window (saleCloseAt) already passed — deriveDepartureAvailability
        // treats "hết thời hạn bán" as authoritative and resolves CLOSED.
        departures: [
          {
            id: 'singapore-2026-08-05',
            tourId: 'singapore',
            departureDate: '2026-08-05',
            departurePoint: 'Hà Nội',
            availabilityStatus: 'AVAILABLE',
            capacity: 18,
            bookedSeats: 10,
            availableSeats: 8,
            saleOpenAt: '2026-05-01',
            saleCloseAt: '2026-07-15',
            price: 12900000,
            currency: 'VND',
            isActive: true,
          },
        ],
        image: { src: '/dest-singapore.webp', alt: 'Singapore, Sentosa', width: 800, height: 600 },
        href: '/tour/singapore',
        matchTags: ['budget:under-15tr', 'budget:15-30tr', 'group:small-group', 'group:corporate', 'preference:city'],
      },
    ],
    viewAllCta: { label: 'Khám phá tour', href: '/tours' },
  },
  destinations: {
    eyebrow: 'Điểm đến',
    title: 'Thế giới trong',
    titleAccent: 'tầm với',
    destinations: [
      { id: 'japan', name: 'Nhật Bản', tagline: 'Tinh tế & bốn mùa', journeyCount: 24, image: { src: '/dest-japan.webp', alt: 'Nhật Bản', width: 600, height: 800 }, href: '/destinations/japan' },
      { id: 'korea', name: 'Hàn Quốc', tagline: 'Năng động & hiện đại', journeyCount: 20, image: { src: '/tour-korea.webp', alt: 'Hàn Quốc', width: 600, height: 800 }, href: '/destinations/korea' },
      { id: 'europe', name: 'Châu Âu', tagline: 'Cổ kính & tráng lệ', journeyCount: 16, image: { src: '/tour-europe.webp', alt: 'Châu Âu', width: 600, height: 800 }, href: '/destinations/europe' },
      { id: 'usa', name: 'Mỹ', tagline: 'Rộng lớn & tự do', journeyCount: 12, image: { src: '/dest-usa.webp', alt: 'Mỹ', width: 600, height: 800 }, href: '/destinations/usa' },
      { id: 'singapore', name: 'Singapore', tagline: 'Hiện đại & sôi động', journeyCount: 18, image: { src: '/dest-singapore.webp', alt: 'Singapore', width: 600, height: 800 }, href: '/destinations/singapore' },
      { id: 'vietnam', name: 'Việt Nam', tagline: 'Di sản & thiên nhiên', journeyCount: 52, image: { src: '/dest-vietnam.webp', alt: 'Việt Nam', width: 600, height: 800 }, href: '/destinations/vietnam' },
    ],
  },
  brandCenter: {
    eyebrow: 'Năng lực',
    title: 'Năng lực & uy tín được khẳng định',
    description:
      'Trích từ Hồ sơ năng lực Minh Việt Travel: pháp lý minh bạch từ 2013, mạng lưới đối tác chiến lược cùng hàng không — khách sạn — resort, và năng lực tổ chức đoàn lớn đã được kiểm chứng qua thực tế vận hành.',
    stories: [
      {
        id: 'mang-luoi-doanh-nghiep',
        category: 'Uy tín & kết nối',
        title: 'Thành viên mạng lưới hơn 1.000 doanh nghiệp khu công nghiệp Việt Nam',
        description:
          'Minh Việt Travel đồng hành cùng cộng đồng doanh nghiệp tại Hải Phòng, nền tảng cho các chương trình MICE, khen thưởng và team building quy mô lớn.',
        date: '07.2025',
        image: { src: '/hsnl-mang-luoi-doanh-nghiep.webp', alt: 'Đại diện Minh Việt Travel tại sự kiện kết nối hơn 1.000 doanh nghiệp khu công nghiệp Việt Nam, Hải Phòng', width: 1600, height: 1066 },
        href: '/ho-so-nang-luc#nang-luc',
        size: 'large',
      },
      {
        id: 'doi-tac-hang-khong',
        category: 'Đối tác chiến lược',
        title: 'Phân phối chính hãng cùng Vietnam Airlines, Vietjet, Bamboo Airways',
        description: 'Liên kết chặt chẽ với các hãng hàng không, Vinpearl, Sun Group, Flamingo — đảm bảo giá cạnh tranh và dịch vụ chính hãng.',
        date: '12.2016',
        image: { src: '/hsnl-doi-tac-vietjet.webp', alt: 'Lễ khai trương đường bay Hải Phòng – Incheon của Vietjet Air, đối tác của Minh Việt Travel', width: 615, height: 461 },
        href: '/ho-so-nang-luc#doi-tac',
        size: 'small',
      },
      {
        id: 'to-chuc-doan-lon',
        category: 'Năng lực tổ chức',
        title: 'Tổ chức đoàn khách doanh nghiệp từ 50–300 người',
        description: 'Quy trình vận hành 6 bước, đội ngũ điều hành 24/7 cho các chương trình team building và tri ân khách hàng quy mô lớn.',
        date: '2025',
        image: { src: '/hsnl-to-chuc-doan-lon.webp', alt: 'Đoàn khách doanh nghiệp tham gia team building trên bãi biển do Minh Việt Travel tổ chức', width: 1580, height: 1054 },
        href: '/ho-so-nang-luc#quy-trinh',
        size: 'small',
      },
    ],
    cta: { label: 'Xem hồ sơ năng lực', href: '/ho-so-nang-luc' },
  },
  finalCta: {
    corporate: {
      eyebrow: 'DOANH NGHIỆP / TỔ CHỨC',
      label: 'Doanh nghiệp / Tổ chức',
      title: 'Nâng tầm hành trình doanh nghiệp của bạn',
      description:
        'Đội ngũ chuyên gia Minh Việt sẵn sàng thiết kế giải pháp du lịch, sự kiện và MICE phù hợp với quy mô, ngân sách và mục tiêu của tổ chức.',
      cta: { label: 'Gửi yêu cầu tư vấn', href: '#lead-form' },
    },
    individual: {
      eyebrow: 'KHÁCH HÀNG CÁ NHÂN',
      label: 'Khách hàng cá nhân',
      title: 'Sẵn sàng cho chuyến đi tiếp theo',
      description:
        'Chia sẻ nhu cầu của bạn, chuyên viên Minh Việt sẽ tư vấn hành trình phù hợp với thời gian, ngân sách và sở thích.',
      cta: { label: 'Gửi yêu cầu tư vấn', href: '#lead-form' },
    },
    phone: '0934 368 132',
    zaloHref: 'https://zalo.me/0934368132',
  },
  seo: {
    title: 'Minh Việt Travel — Kiến tạo hành trình, kết nối giá trị',
    description:
      'Đối tác tin cậy của doanh nghiệp, tổ chức & khách hàng cao cấp. Tour đoàn, MICE & Sự kiện, Khách sạn, Du thuyền, Vé máy bay, Visa — trải nghiệm chuyên nghiệp, ứng dụng AI.',
    canonicalPath: '/',
    organizationName: 'Công ty Cổ phần Thương mại & Dịch vụ Du lịch Minh Việt',
    organizationLogo: '/logo-minhviet.png',
    contactPhone: '+84934368132',
    contactEmail: 'info@minhviettravel.com',
    addressLocality: 'Hải Phòng',
    addressCountry: 'VN',
  },
}
