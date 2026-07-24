import Image from 'next/image'
import { ArrowUpRight, Clock } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

const SAMPLES = [
  {
    title: 'Company Trip Hạ Long',
    duration: '3N2Đ',
    fit: 'Doanh nghiệp 50–200 người',
    highlight: 'Du thuyền vịnh Hạ Long, teambuilding trên biển, gala dinner ngoài trời.',
    image: '/images/hero/ha-long-bay.jpg',
  },
  {
    title: 'MICE Đà Nẵng',
    duration: '4N3Đ',
    fit: 'Hội nghị 100–500 người',
    highlight: 'Trung tâm hội nghị 5 sao, hoạt động ngoại khóa và gala tổng kết.',
    image: '/editorial-mice.webp',
  },
  {
    title: 'Team Building Cát Bà',
    duration: '2N1Đ',
    fit: 'Phòng ban 30–80 người',
    highlight: 'Thử thách đồng đội trên đảo, BBQ bãi biển, không gian gắn kết tự nhiên.',
    image: '/brand-group.webp',
  },
  {
    title: 'Gala Dinner Nha Trang',
    duration: '3N2Đ',
    fit: 'Sự kiện tri ân, tổng kết năm',
    highlight: 'Đêm tiệc chủ đề riêng, sân khấu và chương trình nghệ thuật theo yêu cầu.',
    image: '/enterprise-mice.webp',
  },
  {
    title: 'Hành trình Nhật Bản cho doanh nghiệp',
    duration: '5N4Đ',
    fit: 'Ban lãnh đạo, đối tác chiến lược',
    highlight: 'Kết hợp công tác và trải nghiệm văn hóa, dịch vụ cao cấp xuyên suốt.',
    image: '/dest-japan.webp',
  },
  {
    title: 'Tour gia đình nghỉ dưỡng',
    duration: '4N3Đ',
    fit: 'Gia đình nhiều thế hệ',
    highlight: 'Resort ven biển, nhịp độ nhẹ nhàng, hoạt động phù hợp mọi lứa tuổi.',
    image: '/dest-vietnam.webp',
  },
] as const

export function InspirationProgramsSection() {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Mẫu hành trình"
          title="Vài ý tưởng để bắt đầu"
          description="Các mẫu dưới đây chỉ để gợi ý — không phải bảng giá cố định."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 60}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-deep/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Clock className="size-3.5" /> {s.duration}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold text-mv-deep-navy">{s.title}</h3>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">
                    Phù hợp với: <span className="font-medium normal-case text-mv-slate">{s.fit}</span>
                  </p>
                  <p className="mt-2.5 flex-1 text-pretty text-sm leading-relaxed text-mv-slate">{s.highlight}</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <MVButton href="#custom-tour-form" variant="outline" size="sm">
                      Xem ý tưởng chương trình <ArrowUpRight className="size-4" />
                    </MVButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-mv-slate">
          Chương trình mẫu có thể điều chỉnh theo nhu cầu thực tế.
        </p>
      </div>
    </section>
  )
}
