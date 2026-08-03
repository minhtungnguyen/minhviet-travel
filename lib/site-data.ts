import {
  Plane,
  Building2,
  Ship,
  Ticket,
  FileCheck2,
  Briefcase,
  MapPinned,
  Users,
  CalendarDays,
  Landmark,
  Sparkles,
  Clock,
  Globe,
  type LucideIcon,
} from 'lucide-react'

export type NavColumn = {
  heading: string
  links: { label: string; href: string; desc?: string }[]
}

export const megaMenu: Record<string, NavColumn[]> = {
  Tours: [
    {
      heading: 'Tour thiết kế riêng',
      links: [
        { label: 'Tour Thiết kế trọn gói', href: '/tours?type=custom', desc: 'Thiết kế theo yêu cầu riêng' },
        { label: 'Tour Doanh nghiệp', href: '/tours?type=corporate', desc: 'Công tác, khảo sát, đối tác' },
        { label: 'Tour Gia đình', href: '/tours?type=family', desc: 'Hành trình cho cả gia đình' },
        { label: 'Tour MICE', href: '/mice', desc: 'Hội nghị, sự kiện doanh nghiệp' },
      ],
    },
    {
      heading: 'Tour ghép theo lịch',
      links: [
        { label: 'Tour Ghép Quốc tế', href: '/tours?type=intl', desc: 'Khởi hành định kỳ, ghép đoàn' },
        { label: 'Tour Ghép Trong nước', href: '/tours?type=domestic', desc: 'Khắp ba miền Việt Nam' },
        { label: 'Tour Team Building', href: '/mice#teambuilding', desc: 'Gắn kết đội ngũ' },
      ],
    },
  ],
  'Doanh nghiệp & MICE': [
    {
      heading: 'Giải pháp MICE',
      links: [
        { label: 'Hội nghị & Hội thảo', href: '/mice#meeting' },
        { label: 'Team Building', href: '/mice#teambuilding' },
        { label: 'Gala Dinner', href: '/mice#gala' },
        { label: 'Incentive Travel', href: '/mice#incentive' },
      ],
    },
    {
      heading: 'Khách hàng',
      links: [
        { label: 'Khu công nghiệp & FDI', href: '/mice#fdi' },
        { label: 'Cơ quan nhà nước', href: '/mice#gov' },
        { label: 'Hiệp hội & Tổ chức', href: '/mice#association' },
        { label: 'Corporate Travel', href: '/mice#corporate' },
      ],
    },
  ],
  'Dịch vụ': [
    {
      heading: 'Lưu trú & Di chuyển',
      links: [
        { label: 'Khách sạn', href: '/hotels' },
        { label: 'Du thuyền', href: '/cruises' },
        { label: 'Vé máy bay', href: '/flights' },
        { label: 'Thuê xe', href: '/car-rental' },
      ],
    },
    {
      heading: 'Dịch vụ hỗ trợ',
      links: [
        { label: 'Vé vui chơi', href: '/tickets' },
        { label: 'Visa', href: '/visa' },
        { label: 'Bảo hiểm du lịch', href: '/insurance' },
        { label: 'Điểm đến', href: '/destinations' },
      ],
    },
  ],
  'Công ty': [
    {
      heading: 'Về Minh Việt',
      links: [
        { label: 'Giới thiệu', href: '/about' },
        { label: 'Dấu ấn Minh Việt', href: '/brand' },
        { label: 'Ban lãnh đạo', href: '/brand/leadership' },
        { label: 'Tuyển dụng', href: '/careers' },
      ],
    },
    {
      heading: 'Kết nối',
      links: [
        { label: 'Tin tức', href: '/brand/news' },
        { label: 'Đối tác', href: '/partners' },
        { label: 'Liên hệ', href: '/contact' },
      ],
    },
  ],
}

export type Service = {
  icon: LucideIcon
  title: string
  desc: string
  href: string
}

export const services: Service[] = [
  { icon: Users, title: 'Tour đoàn', desc: 'Thiết kế riêng cho tập thể doanh nghiệp', href: '/tours?type=group' },
  { icon: Briefcase, title: 'MICE & Sự kiện', desc: 'Hội nghị, sự kiện, incentive quy mô lớn', href: '/mice' },
  { icon: Sparkles, title: 'Dịch vụ lẻ', desc: 'Dịch vụ linh hoạt theo nhu cầu', href: '/services' },
  { icon: Building2, title: 'Khách sạn', desc: 'Hệ thống lưu trú cao cấp toàn cầu', href: '/hotels' },
  { icon: Ship, title: 'Du thuyền', desc: 'Hành trình nghỉ dưỡng sang trọng', href: '/cruises' },
  { icon: Plane, title: 'Vé máy bay', desc: 'Đặt vé & tư vấn hành trình tối ưu', href: '/flights' },
  { icon: Ticket, title: 'Vé vui chơi', desc: 'Công viên, show diễn, trải nghiệm', href: '/tickets' },
  { icon: FileCheck2, title: 'Visa', desc: 'Hồ sơ & tư vấn thị thực toàn diện', href: '/visa' },
]

export type EnterpriseSolution = {
  id: string
  icon: LucideIcon
  title: string
  desc: string
}

export const enterpriseSolutions: EnterpriseSolution[] = [
  { id: 'group', icon: Users, title: 'Tour đoàn', desc: 'Tổ chức chuyên nghiệp cho hàng trăm khách trong một hành trình.' },
  { id: 'teambuilding', icon: CalendarDays, title: 'Team Building', desc: 'Chương trình gắn kết đội ngũ theo văn hóa doanh nghiệp.' },
  { id: 'gala', icon: Landmark, title: 'Gala Dinner', desc: 'Sự kiện tối cao cấp, dàn dựng trọn gói theo chủ đề.' },
  { id: 'meeting', icon: Briefcase, title: 'Hội nghị', desc: 'Meeting & hội thảo với hạ tầng và hậu cần đầy đủ.' },
  { id: 'incentive', icon: MapPinned, title: 'Incentive', desc: 'Du lịch khen thưởng nâng tầm động lực nhân sự.' },
  { id: 'ct-solution', icon: Building2, title: 'Corporate Travel', desc: 'Quản lý công tác phí và di chuyển cho doanh nghiệp.' },
]

export type ClientSegment = { id: string; icon: LucideIcon; title: string; desc: string }

export const miceClientSegments: ClientSegment[] = [
  { id: 'fdi', icon: Building2, title: 'Khu công nghiệp & FDI', desc: 'Chương trình cho chuyên gia, kỹ sư và người lao động nước ngoài.' },
  { id: 'gov', icon: Landmark, title: 'Cơ quan nhà nước', desc: 'Tổ chức đoàn công tác, hội nghị theo quy chế đấu thầu & ngân sách.' },
  { id: 'association', icon: Users, title: 'Hiệp hội & tổ chức', desc: 'Sự kiện thường niên, đại hội thành viên quy mô lớn.' },
  { id: 'corporate', icon: Briefcase, title: 'Corporate Travel', desc: 'Quản lý công tác phí, di chuyển và lưu trú cho toàn doanh nghiệp.' },
]

export type Tour = {
  id: string
  title: string
  country: string
  category: 'Châu Á' | 'Châu Âu' | 'Nội địa'
  duration: string
  price: string
  departure: string
  date: string
  image: string
  seats: string
  rating?: number
  featured?: boolean
}

export const tours: Tour[] = [
  {
    id: 'tokyo',
    title: 'Tokyo — Núi Phú Sĩ — Hakone',
    country: 'Nhật Bản',
    category: 'Châu Á',
    duration: '5N4Đ',
    price: '27.900.000₫',
    departure: 'Hà Nội',
    date: '25/07/2026',
    image: '/tour-tokyo.webp',
    seats: 'Còn 8 chỗ',
    rating: 4.9,
    featured: true,
  },
  {
    id: 'korea',
    title: 'Seoul — Nami — Everland mùa thu',
    country: 'Hàn Quốc',
    category: 'Châu Á',
    duration: '5N4Đ',
    price: '16.900.000₫',
    departure: 'Hà Nội',
    date: '28/07/2026',
    image: '/tour-korea.webp',
    seats: 'Còn 12 chỗ',
    rating: 4.8,
  },
  {
    id: 'europe',
    title: 'Thụy Sĩ — Pháp — Ý cao cấp',
    country: 'Châu Âu',
    category: 'Châu Âu',
    duration: '9N8Đ',
    price: '64.900.000₫',
    departure: 'TP. Hồ Chí Minh',
    date: '02/08/2026',
    image: '/tour-europe.webp',
    seats: 'Còn 6 chỗ',
    rating: 5.0,
    featured: true,
  },
  {
    id: 'bali',
    title: 'Bali — Thiên đường nghỉ dưỡng',
    country: 'Indonesia',
    category: 'Châu Á',
    duration: '4N3Đ',
    price: '13.900.000₫',
    departure: 'TP. Hồ Chí Minh',
    date: '30/07/2026',
    image: '/tour-bali.webp',
    seats: 'Còn 15 chỗ',
    rating: 4.7,
  },
  {
    id: 'phuquoc',
    title: 'Phú Quốc — Nam Đảo — Hòn Thơm',
    country: 'Việt Nam',
    category: 'Nội địa',
    duration: '3N2Đ',
    price: '4.990.000₫',
    departure: 'TP. Hồ Chí Minh',
    date: '21/07/2026',
    image: '/dest-vietnam.webp',
    seats: 'Còn 9 chỗ',
    rating: 4.8,
    featured: true,
  },
  {
    id: 'singapore',
    title: 'Singapore — Sentosa — Gardens by the Bay',
    country: 'Singapore',
    category: 'Châu Á',
    duration: '4N3Đ',
    price: '12.900.000₫',
    departure: 'Hà Nội',
    date: '26/07/2026',
    image: '/dest-singapore.webp',
    seats: 'Còn 10 chỗ',
    rating: 4.9,
  },
]

export const tourFilters = ['Tất cả', 'Châu Á', 'Châu Âu', 'Nội địa'] as const

export type SeoGroup = { heading: string; links: string[] }

export const seoLinks: SeoGroup[] = [
  {
    heading: 'Du lịch nước ngoài',
    links: ['Châu Âu', 'Hàn Quốc', 'Nhật Bản', 'Đài Loan', 'Thái Lan', 'Singapore', 'Úc', 'Mỹ', 'Tây - Nam Âu'],
  },
  {
    heading: 'Du lịch trong nước',
    links: ['Sapa', 'Đà Nẵng', 'Nha Trang', 'Ninh Bình', 'Hạ Long', 'Đà Lạt', 'Quy Nhơn', 'Phú Quốc', 'Miền Tây'],
  },
  {
    heading: 'Khách sạn',
    links: ['Đà Nẵng', 'Nha Trang', 'Hạ Long', 'Quy Nhơn', 'Phú Quốc', 'Hà Nội', 'Hội An', 'Hồ Chí Minh', 'Tam Đảo'],
  },
  {
    heading: 'Du thuyền Hạ Long',
    links: ['Mon Cheri', 'Paradise Delight', 'Catamaran', 'Ambassador', 'Sea Stars', 'Scarlet Pearl', 'Paradise Grand'],
  },
  {
    heading: 'Vé máy bay',
    links: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Phú Quốc', 'Trung Quốc', 'Hàn Quốc', 'Nhật Bản', 'Thái Lan'],
  },
]

export type Destination = {
  name: string
  tagline: string
  tours: string
  image: string
}

export const destinations: Destination[] = [
  { name: 'Nhật Bản', tagline: 'Tinh tế & bốn mùa', tours: '24 tour', image: '/dest-japan.webp' },
  { name: 'Hàn Quốc', tagline: 'Năng động & hiện đại', tours: '20 tour', image: '/tour-korea.webp' },
  { name: 'Châu Âu', tagline: 'Cổ kính & tráng lệ', tours: '16 tour', image: '/tour-europe.webp' },
  { name: 'Mỹ', tagline: 'Rộng lớn & tự do', tours: '12 tour', image: '/dest-usa.webp' },
  { name: 'Singapore', tagline: 'Hiện đại & sôi động', tours: '18 tour', image: '/dest-singapore.webp' },
  { name: 'Úc', tagline: 'Thiên nhiên hoang dã', tours: '14 tour', image: '/dest-australia.webp' },
  { name: 'Thái Lan', tagline: 'Rực rỡ & thân thiện', tours: '30 tour', image: '/dest-thailand.webp' },
  { name: 'Việt Nam', tagline: 'Di sản & thiên nhiên', tours: '52 tour', image: '/dest-vietnam.webp' },
]

/**
 * Every value here must match the sourced figures already verified for
 * the homepage trust strip (`lib/cms/content/homepage.seed.ts`) — never
 * a rounder or larger number invented for this page. See audit finding
 * 3.3 (fabricated metrics with no source/asOf).
 */
export type WhyStat = { value: number; suffix: string; label: string; icon: LucideIcon; source: string; asOf: string }

export const whyStats: WhyStat[] = [
  { value: 13, suffix: '+', label: 'Năm kinh nghiệm', icon: Clock, source: 'Hồ sơ năng lực Minh Việt Travel (thành lập 18/11/2013)', asOf: '2026' },
  { value: 5000, suffix: '+', label: 'Doanh nghiệp tin tưởng', icon: Briefcase, source: 'CRM nội bộ Minh Việt, tổng lũy kế', asOf: '2026-Q2' },
  { value: 200, suffix: 'K+', label: 'Khách hàng hài lòng', icon: Users, source: 'Báo cáo vận hành nội bộ', asOf: '2026-Q2' },
  { value: 60, suffix: '+', label: 'Đối tác toàn cầu', icon: Globe, source: 'Danh mục đối tác Minh Việt', asOf: '2026-Q2' },
]

export type Experience = {
  title: string
  desc: string
  image: string
  href: string
}

export const experiences: Experience[] = [
  {
    title: 'Tour đoàn',
    desc: 'Thiết kế hành trình riêng cho doanh nghiệp, cơ quan, tổ chức.',
    image: '/brand-group.webp',
    href: '/tours?type=group',
  },
  {
    title: 'MICE & Sự kiện',
    desc: 'Tổ chức hội nghị, hội thảo, kỷ niệm thành lập công ty, team building.',
    image: '/enterprise-mice.webp',
    href: '/mice',
  },
  {
    title: 'Du lịch sự kiện',
    desc: 'Kỷ niệm công ty, lễ tri ân, ra mắt sản phẩm, gala dinner đẳng cấp.',
    image: '/brand-signing.webp',
    href: '/mice#gala',
  },
  {
    title: 'Du thuyền cao cấp',
    desc: 'Trải nghiệm du thuyền 5 sao đẳng cấp quốc tế trên mọi hải trình.',
    image: '/tour-bali.webp',
    href: '/cruises',
  },
]

export type BrandStory = {
  category: string
  title: string
  desc: string
  image: string
  date: string
  size: 'large' | 'small'
}

export const brandStories: BrandStory[] = [
  {
    category: 'Dấu ấn Minh Việt',
    title: 'Minh Việt ký kết chiến lược cùng liên minh khu công nghiệp phía Bắc',
    desc: 'Đồng hành tổ chức chương trình du lịch và MICE cho hơn 40.000 lao động và chuyên gia FDI.',
    image: '/brand-signing.webp',
    date: '18.06.2026',
    size: 'large',
  },
  {
    category: 'Lãnh đạo & chuyên gia',
    title: 'Thông điệp từ Ban điều hành về hành trình chuyển đổi số',
    desc: 'Tầm nhìn AI-first cho ngành du lịch doanh nghiệp.',
    image: '/brand-leadership.webp',
    date: '02.06.2026',
    size: 'small',
  },
  {
    category: 'Năng lực tổ chức',
    title: 'Tổ chức thành công hành trình 1.200 khách tại Nhật Bản',
    desc: 'Vận hành hậu cần quy mô lớn với tiêu chuẩn cao cấp.',
    image: '/brand-group.webp',
    date: '20.05.2026',
    size: 'small',
  },
]

export const partners: string[] = [
  'Vietnam Airlines',
  'Singapore Airlines',
  'Marriott',
  'Accor',
  'InterContinental',
  'Vinpearl',
  'Korean Air',
  'ANA',
]

export const airlinePartners: string[] = [
  'Vietnam Airlines',
  'Vietjet Air',
  'Bamboo Airways',
  'Singapore Airlines',
  'Korean Air',
  'ANA',
  'Qatar Airways',
  'Emirates',
]

export const hotelPartners: string[] = [
  'Vinpearl',
  'Marriott',
  'Accor',
  'InterContinental',
  'Novotel',
  'Pullman',
  'Mường Thanh',
  'Movenpick',
]

export const aiFeatures = [
  'Gợi ý hành trình theo ngân sách & thời gian',
  'So sánh dịch vụ và điểm đến trong vài giây',
  'Tối ưu lịch trình cho đoàn đông người',
  'Chuyên viên tư vấn xác nhận trước khi đặt',
]
