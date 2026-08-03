import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Compass,
  Download,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plane,
  Quote,
  Ship,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
} from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Hồ sơ năng lực | Minh Việt Travel',
  description:
    'Hồ sơ năng lực Minh Việt Travel: pháp lý minh bạch từ 2013, năng lực tổ chức, đối tác chiến lược và quy trình vận hành — xem trực tuyến hoặc tải xuống PDF.',
}

const PDF_HREF = '/ho-so-nang-luc-minh-viet.pdf'

const pillars = [
  {
    icon: Compass,
    title: 'Tầm nhìn',
    desc: 'Trở thành thương hiệu du lịch uy tín – sáng tạo – khác biệt hàng đầu tại Hải Phòng, nơi mỗi hành trình là một trải nghiệm cảm xúc sâu sắc.',
  },
  {
    icon: Target,
    title: 'Sứ mệnh',
    desc: 'Mang đến sản phẩm và dịch vụ du lịch chất lượng, an toàn, tiện lợi — đồng hành cùng khách hàng từ khâu tư vấn đến trải nghiệm thực tế.',
  },
  {
    icon: ShieldCheck,
    title: 'Giá trị cốt lõi',
    desc: 'Uy tín – Chất lượng – Sáng tạo – Đồng hành, đặt lên hàng đầu trong mọi giao dịch và cam kết với khách hàng, đối tác.',
  },
]

const legalFacts = [
  { label: 'Tên pháp nhân', value: 'Công ty Cổ phần Thương mại & Dịch vụ Du lịch Minh Việt' },
  { label: 'Mã số doanh nghiệp', value: '0201320592' },
  { label: 'Ngày thành lập', value: '18/11/2013' },
  { label: 'Giấy phép lữ hành nội địa', value: 'Số 31-0062/2022/SDL-GPLHNĐ, cấp 08/07/2022' },
  { label: 'Trụ sở', value: 'Tầng 3, Tòa nhà VCCI Duyên Hải Bắc Bộ, 464 Lạch Tray, Hải Phòng' },
  { label: 'Người đại diện pháp luật', value: 'Nguyễn Minh Tùng — Giám đốc' },
]

const advantages = [
  'Kinh nghiệm tổ chức hàng trăm đoàn khách lớn nhỏ mỗi năm',
  'Thiết kế chương trình riêng theo mục tiêu từng doanh nghiệp',
  'Chi phí tối ưu — báo giá minh bạch — không phát sinh',
  'Đội ngũ điều hành chuyên nghiệp hỗ trợ 24/7',
  'Đối tác chiến lược hàng không — khách sạn — resort toàn quốc',
  'Khả năng tổ chức đoàn lớn từ 50–300 khách',
  'Quy trình vận hành bài bản — kiểm soát rủi ro chặt chẽ',
]

const services = [
  { icon: Compass, title: 'Tour du lịch trong / ngoài nước' },
  { icon: Plane, title: 'Vé máy bay' },
  { icon: Building2, title: 'Khách sạn — Resort — Villa' },
  { icon: Ship, title: 'Du thuyền cao cấp' },
  { icon: Ticket, title: 'Vé khu vui chơi — cáp treo — tham quan' },
  { icon: Sparkles, title: 'Combo nghỉ dưỡng' },
]

const corporateProducts = [
  { title: 'Tour khen thưởng (Incentive Tour)', desc: 'Tri ân — gắn kết đội ngũ — thúc đẩy tinh thần làm việc.' },
  { title: 'Tour hội nghị (MICE Tour)', desc: 'Kết hợp du lịch và hội nghị chuyên nghiệp, hỗ trợ tổ chức trọn gói.' },
  { title: 'Team building — Gala Dinner', desc: 'Xây dựng văn hóa doanh nghiệp, tăng tính kết nối nội bộ.' },
  { title: 'Du lịch đào tạo & trải nghiệm (Learning Tour)', desc: 'Kết hợp nghỉ dưỡng — huấn luyện kỹ năng — gắn kết nhóm.' },
  { title: 'Chương trình tri ân khách hàng', desc: 'Tổ chức tour theo yêu cầu riêng, nâng cao hình ảnh thương hiệu.' },
]

const familyProducts = [
  { title: 'Nghỉ dưỡng biển & khám phá', desc: 'Phú Quốc, Đà Nẵng, Nha Trang, Quy Nhơn, Hà Giang, Sapa, Đà Lạt.' },
  { title: 'Di sản & văn hóa', desc: 'Hội An — Huế — Ninh Bình.' },
  { title: 'Tour gia đình & nhóm bạn', desc: 'Lễ, Tết, hè: tour 3N2Đ, 4N3Đ linh hoạt; nhóm riêng 4–15 người.' },
  { title: 'Tour cao cấp & trải nghiệm đặc biệt', desc: '"Private Luxury": xe riêng, hướng dẫn viên riêng, dịch vụ cao cấp.' },
]

const process = [
  { step: '1', title: 'Tiếp nhận nhu cầu', desc: 'Lắng nghe mục tiêu chương trình, ngân sách, số lượng khách, thời gian tổ chức.' },
  { step: '2', title: 'Tư vấn & thiết kế chương trình', desc: 'Đề xuất concept phù hợp: nghỉ dưỡng, team building, hội nghị, tri ân khách hàng...' },
  { step: '3', title: 'Báo giá & tối ưu chi phí', desc: 'Xây dựng phương án ngân sách tối ưu, minh bạch từng hạng mục.' },
  { step: '4', title: 'Ký hợp đồng & chuẩn bị', desc: 'Triển khai đặt dịch vụ, xây dựng kịch bản chi tiết, phân công nhân sự.' },
  { step: '5', title: 'Tổ chức vận hành thực tế', desc: 'Điều hành chuyên nghiệp, kiểm soát chất lượng từng khâu.' },
  { step: '6', title: 'Chăm sóc sau chương trình', desc: 'Khảo sát hài lòng, báo cáo tổng kết, duy trì quan hệ hợp tác lâu dài.' },
]

const commitments = [
  { icon: BadgeCheck, title: 'Dịch vụ chuyên nghiệp — chất lượng vượt trội', desc: 'Mọi sản phẩm được xây dựng với tiêu chuẩn cao nhất, đảm bảo sự hài lòng của khách hàng.' },
  { icon: Sparkles, title: 'Giá trị tối ưu — chính sách linh hoạt', desc: 'Giải pháp hiệu quả, chi phí hợp lý, cùng chính sách đổi — hoàn — hủy minh bạch.' },
  { icon: ShieldCheck, title: 'Uy tín tuyệt đối — đồng hành bền vững', desc: 'Đặt lợi ích khách hàng làm trung tâm, đồng hành từ khâu tư vấn đến trải nghiệm thực tế.' },
  { icon: CheckCircle2, title: 'Liên tục sáng tạo — không ngừng phát triển', desc: 'Cập nhật xu hướng mới, tạo ra sản phẩm độc đáo, phù hợp nhu cầu đa dạng.' },
]

const partners = ['Vietnam Airlines', 'Vietjet Air', 'Bamboo Airways', 'Vinpearl', 'Sun Group', 'Flamingo']

const gallery = [
  { src: '/hsnl-tour-cat-ba.webp', alt: 'Đoàn khách Minh Việt Travel tại khu nghỉ dưỡng Cát Bà' },
  { src: '/hsnl-tour-thuyen-nha-trang.webp', alt: 'Đoàn khách trải nghiệm du thuyền tại Nha Trang cùng cờ hiệu Minh Việt' },
  { src: '/hsnl-tour-da-nang.webp', alt: 'Đoàn khách tham quan Chùa Linh Ứng, Đà Nẵng' },
  { src: '/hsnl-cho-den-long.webp', alt: 'Đoàn khách tham quan phố cổ trang trí đèn lồng' },
  { src: '/hsnl-doi-ngu-van-hanh.webp', alt: 'Đội ngũ điều hành Minh Việt Travel tại văn phòng' },
  { src: '/hsnl-team-building.webp', alt: 'Đoàn khách doanh nghiệp tham gia team building' },
]

export default function CapabilityProfilePage() {
  return (
    <SiteChrome>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mv-deep-navy">
        <div className="absolute inset-0">
          <Image
            src="/hsnl-mang-luoi-doanh-nghiep.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-mv-hero" />
        </div>

        <div className="container-mv relative flex min-h-[46vh] flex-col justify-end pt-32 pb-14 lg:min-h-[50vh] lg:pb-16">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-paper/55" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-paper">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-paper/80">Hồ sơ năng lực</span>
          </nav>

          <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-sky-cyan">
            <span className="h-px w-10 bg-mv-sky-cyan/50" />
            Hồ sơ năng lực doanh nghiệp
          </p>
          <h1 className="mt-5 max-w-2xl text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-paper sm:text-5xl">
            Minh Việt Travel — Năng lực & uy tín được khẳng định
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-paper/75 sm:text-lg">
            Pháp lý minh bạch từ 2013, mạng lưới đối tác chiến lược và năng lực tổ chức đoàn lớn — toàn bộ nội dung
            trong tài liệu Hồ sơ năng lực chính thức, xem trực tuyến hoặc tải về máy.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="journey" size="lg" render={<a href={PDF_HREF} download />}>
              Tải xuống PDF <Download className="size-5" />
            </Button>
            <Button variant="outline-light" size="lg" render={<Link href="#lien-he" />}>
              Liên hệ tư vấn
            </Button>
          </div>
          <p className="mt-4 text-xs text-paper/50">Tệp PDF · 15 trang · xem tốt trên điện thoại & máy tính</p>
        </div>
      </section>

      {/* Thư ngỏ */}
      <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
        <div className="container-mv">
          <Reveal>
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
              <Quote className="size-7 text-mv-sky-cyan" />
              <p className="text-balance font-display text-xl leading-snug text-mv-deep-navy sm:text-2xl">
                “Công ty Cổ phần Thương mại &amp; Dịch vụ Du lịch Minh Việt được thành lập năm 2013, với khát vọng
                trở thành người bạn đồng hành tin cậy trên mọi hành trình — mỗi chuyến đi là một kỷ niệm đáng nhớ.”
              </p>
              <p className="text-sm text-mv-slate">Trích Thư ngỏ, Hồ sơ năng lực Minh Việt Travel</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tầm nhìn - Sứ mệnh - Giá trị */}
      <section className="section-py-md border-t border-mv-border-soft bg-background">
        <div className="container-mv">
          <SectionHeading eyebrow="Định hướng" title="Tầm nhìn, sứ mệnh & giá trị cốt lõi" className="max-w-2xl" />
          <Reveal className="mt-8 grid gap-6 sm:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-2xl border border-mv-border-soft p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <p className="mt-4 font-display text-lg font-bold text-mv-deep-navy">{p.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-mv-slate">{p.desc}</p>
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* Pháp lý */}
      <section id="phap-ly" className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue scroll-mt-24">
        <div className="container-mv">
          <SectionHeading
            eyebrow="Thông tin pháp lý"
            title="Pháp nhân minh bạch, hoạt động hợp lệ"
            description="Trích từ Giấy chứng nhận đăng ký doanh nghiệp và Giấy phép kinh doanh dịch vụ lữ hành nội địa — bản đầy đủ có trong file PDF tải xuống."
            className="max-w-2xl"
          />
          <Reveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {legalFacts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-mv-border-soft bg-background p-5">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-mv-journey-blue">
                  <BadgeCheck className="size-3.5" />
                  {f.label}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-mv-deep-navy">{f.value}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Lý do chọn Minh Việt */}
      <section id="nang-luc" className="section-py-md border-t border-mv-border-soft bg-background scroll-mt-24">
        <div className="container-mv grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Vì sao chọn Minh Việt"
              title="Đối tác tin cậy cho mọi hành trình doanh nghiệp"
              description="Minh Việt Travel tự hào là đơn vị tổ chức du lịch và sự kiện chuyên nghiệp, phục vụ khách hàng doanh nghiệp trên toàn quốc."
            />
            <ul className="mt-6 space-y-3">
              {advantages.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm leading-relaxed text-mv-slate">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-mv-journey-blue" />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft-lg">
              <Image
                src="/hsnl-to-chuc-doan-lon.webp"
                alt="Đoàn khách doanh nghiệp tham gia team building trên bãi biển do Minh Việt Travel tổ chức"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dịch vụ */}
      <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
        <div className="container-mv">
          <SectionHeading eyebrow="Dịch vụ cung cấp" title="Hệ sinh thái dịch vụ trọn gói" className="max-w-2xl" />
          <Reveal className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.title}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-mv-border-soft bg-background p-6 text-center"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-mv-deep-navy">{s.title}</span>
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* Sản phẩm doanh nghiệp / cá nhân */}
      <section className="section-py-md border-t border-mv-border-soft bg-background">
        <div className="container-mv grid gap-10 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl">
              <Image
                src="/hsnl-team-building.webp"
                alt="Đoàn khách doanh nghiệp tham gia trò chơi team building trên bãi biển"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="eyebrow text-[11px] font-semibold text-mv-journey-blue">Dành cho doanh nghiệp</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-mv-deep-navy">Giải pháp du lịch toàn diện</h3>
            <div className="mt-5 space-y-4">
              {corporateProducts.map((p) => (
                <div key={p.title} className="border-t border-mv-border-soft pt-4">
                  <p className="font-semibold text-mv-deep-navy">{p.title}</p>
                  <p className="mt-1 text-sm text-mv-slate">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl">
              <Image
                src="/hsnl-gia-dinh-nha-trang.webp"
                alt="Gia đình tham quan di tích Tháp Bà, Nha Trang cùng Minh Việt Travel"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="eyebrow text-[11px] font-semibold text-mv-journey-blue">Cá nhân, gia đình & nhóm nhỏ</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-mv-deep-navy">Hành trình đáng nhớ cho mỗi gia đình</h3>
            <div className="mt-5 space-y-4">
              {familyProducts.map((p) => (
                <div key={p.title} className="border-t border-mv-border-soft pt-4">
                  <p className="font-semibold text-mv-deep-navy">{p.title}</p>
                  <p className="mt-1 text-sm text-mv-slate">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quy trình 6 bước */}
      <section id="quy-trinh" className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue scroll-mt-24">
        <div className="container-mv">
          <SectionHeading eyebrow="Quy trình" title="Tổ chức chuyên nghiệp — 6 bước chuẩn hóa" className="max-w-2xl" />
          <Reveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((p) => (
              <div key={p.step} className="rounded-2xl border border-mv-border-soft bg-background p-6">
                <span className="grid size-9 place-items-center rounded-full bg-mv-journey-blue font-display text-sm font-bold text-white">
                  {p.step}
                </span>
                <p className="mt-4 font-semibold text-mv-deep-navy">{p.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mv-slate">{p.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Hình ảnh thực tế */}
      <section className="section-py-md border-t border-mv-border-soft bg-background">
        <div className="container-mv">
          <SectionHeading
            eyebrow="Hình ảnh thực tế"
            title="Những hành trình Minh Việt Travel đã tổ chức"
            className="max-w-2xl"
          />
          <Reveal className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.map((g) => (
              <div key={g.src} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={g.src} alt={g.alt} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Khách hàng & Đối tác */}
      <section id="doi-tac" className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue scroll-mt-24">
        <div className="container-mv grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Khách hàng & Đối tác"
              title="Đối tác phân phối chính hãng của các thương hiệu lớn"
              description="Minh Việt Travel tự hào phục vụ đa dạng khách hàng — từ cá nhân, gia đình đến doanh nghiệp, trường học và tổ chức — với sản phẩm chính hãng, giá trị và uy tín."
            />
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-4" aria-label="Đối tác của Minh Việt Travel">
              {partners.map((p) => (
                <li key={p} className="font-display text-lg font-semibold text-mv-deep-navy">
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft-lg">
              <Image
                src="/hsnl-doi-tac-vietjet.webp"
                alt="Lễ khai trương đường bay Hải Phòng – Incheon của Vietjet Air"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cam kết */}
      <section className="section-py-md border-t border-mv-border-soft bg-background">
        <div className="container-mv">
          <SectionHeading eyebrow="Cam kết" title="Minh Việt Travel cam kết" className="max-w-2xl" />
          <Reveal className="mt-8 grid gap-6 sm:grid-cols-2">
            {commitments.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.title} className="flex gap-4 rounded-2xl border border-mv-border-soft p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-semibold text-mv-deep-navy">{c.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-mv-slate">{c.desc}</p>
                  </div>
                </div>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* Lời cảm ơn / Liên hệ */}
      <section id="lien-he" className="section-py-lg border-t border-mv-border-soft bg-mv-deep-navy scroll-mt-24">
        <div className="container-mv">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Quote className="mx-auto size-7 text-mv-sky-cyan" />
              <p className="mt-4 text-balance font-display text-xl leading-snug text-paper sm:text-2xl">
                “Trân trọng cảm ơn Quý công ty đã dành thời gian quan tâm đến Minh Việt Travel. Kính chúc Quý công ty
                ngày càng phát triển thịnh vượng.”
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
              <a
                href="tel:0934368132"
                className="flex items-center gap-3 rounded-2xl border border-white/15 p-5 text-sm text-paper/80 transition-colors hover:border-mv-sky-cyan hover:text-paper"
              >
                <Phone className="size-4.5 shrink-0 text-mv-sky-cyan" />
                0934 368 132 / 0906 001 359
              </a>
              <a
                href="mailto:lienhe@minhviettravel.com"
                className="flex items-center gap-3 rounded-2xl border border-white/15 p-5 text-sm text-paper/80 transition-colors hover:border-mv-sky-cyan hover:text-paper"
              >
                <Mail className="size-4.5 shrink-0 text-mv-sky-cyan" />
                lienhe@minhviettravel.com
              </a>
              <a
                href="https://www.minhviettravel.com"
                className="flex items-center gap-3 rounded-2xl border border-white/15 p-5 text-sm text-paper/80 transition-colors hover:border-mv-sky-cyan hover:text-paper"
              >
                <Globe className="size-4.5 shrink-0 text-mv-sky-cyan" />
                minhviettravel.com
              </a>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 p-5 text-sm text-paper/80">
                <MapPin className="size-4.5 shrink-0 text-mv-sky-cyan" />
                Tầng 3, VCCI Duyên Hải Bắc Bộ, 464 Lạch Tray, Hải Phòng
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="journey" size="lg" render={<a href={PDF_HREF} download />}>
                Tải xuống Hồ sơ năng lực (PDF) <Download className="size-5" />
              </Button>
              <Button variant="outline-light" size="lg" render={<Link href="/contact" />}>
                Nhận tư vấn giải pháp <ArrowUpRight className="size-5" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  )
}
