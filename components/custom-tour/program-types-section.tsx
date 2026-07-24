import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

const PROGRAM_TYPES = [
  {
    title: 'Tour doanh nghiệp',
    desc: 'Hành trình gắn kết nội bộ, kết hợp nghỉ dưỡng và hoạt động xây dựng văn hoá công ty.',
    fit: 'Ban lãnh đạo, phòng nhân sự',
    image: '/brand-group.webp',
  },
  {
    title: 'Company Trip',
    desc: 'Chuyến đi thường niên cho toàn thể nhân viên, cân bằng giữa nghỉ ngơi và trải nghiệm.',
    fit: 'Doanh nghiệp mọi quy mô',
    image: '/images/hero/ha-long-bay.jpg',
  },
  {
    title: 'MICE',
    desc: 'Hội nghị, hội thảo, triển lãm kết hợp du lịch — vận hành theo tiêu chuẩn tổ chức quốc tế.',
    fit: 'Tập đoàn, tổ chức quốc tế',
    image: '/editorial-mice.webp',
  },
  {
    title: 'Hội nghị / Hội thảo',
    desc: 'Không gian, hậu cần và điều phối cho sự kiện chuyên môn quy mô vừa và lớn.',
    fit: 'Cơ quan, hiệp hội ngành',
    image: '/brand-signing.webp',
  },
  {
    title: 'Team Building',
    desc: 'Hoạt động thử thách và kết nối đội nhóm, thiết kế theo mục tiêu văn hoá doanh nghiệp.',
    fit: 'Phòng ban, dự án',
    image: '/images/hero/sapa-terraces.jpg',
  },
  {
    title: 'Gala Dinner',
    desc: 'Đêm tiệc trang trọng — sân khấu, ẩm thực và chương trình nghệ thuật theo chủ đề riêng.',
    fit: 'Sự kiện tri ân, tổng kết năm',
    image: '/enterprise-mice.webp',
  },
  {
    title: 'Tour khách hàng / đối tác',
    desc: 'Hành trình tri ân và chăm sóc khách hàng, đối tác chiến lược quan trọng.',
    fit: 'Bộ phận kinh doanh, đối ngoại',
    image: '/brand-flatlay.webp',
  },
  {
    title: 'Tour gia đình',
    desc: 'Hành trình nghỉ dưỡng nhiều thế hệ, nhịp độ nhẹ nhàng, phù hợp trẻ nhỏ và người lớn tuổi.',
    fit: 'Gia đình, dòng họ',
    image: '/dest-vietnam.webp',
  },
  {
    title: 'Tour học sinh',
    desc: 'Chương trình ngoại khoá, trải nghiệm học tập gắn với chủ đề giáo dục cụ thể.',
    fit: 'Trường học, trung tâm giáo dục',
    image: '/dest-thailand.webp',
  },
  {
    title: 'Tour đoàn riêng',
    desc: 'Hành trình dành riêng cho một đoàn khách, không ghép chung với đoàn khác.',
    fit: 'Nhóm khách yêu cầu riêng tư',
    image: '/images/hero/ninh-binh.jpg',
  },
  {
    title: 'Tour nghỉ dưỡng',
    desc: 'Trải nghiệm resort cao cấp, ưu tiên chất lượng lưu trú và thời gian thư giãn.',
    fit: 'Khách VIP, cấp quản lý',
    image: '/tour-bali.webp',
  },
  {
    title: 'Tour trải nghiệm',
    desc: 'Hành trình khám phá văn hoá, ẩm thực và điểm đến mới theo sở thích riêng của đoàn.',
    fit: 'Nhóm bạn, người yêu du lịch',
    image: '/dest-japan.webp',
  },
] as const

export function ProgramTypesSection() {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Loại chương trình"
          title="Thiết kế cho mọi mục đích chuyến đi"
          description="Mỗi loại hình dưới đây là điểm khởi đầu, không phải khuôn cố định — chương trình cuối cùng luôn được dựng riêng theo yêu cầu của bạn."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAM_TYPES.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 60}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold text-mv-deep-navy">{p.title}</h3>
                  <p className="mt-1.5 flex-1 text-pretty text-sm leading-relaxed text-mv-slate">{p.desc}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">
                    Phù hợp với: <span className="font-medium normal-case text-mv-slate">{p.fit}</span>
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <MVButton href="#custom-tour-form" variant="outline" size="sm">
                      Yêu cầu thiết kế <ArrowUpRight className="size-4" />
                    </MVButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
