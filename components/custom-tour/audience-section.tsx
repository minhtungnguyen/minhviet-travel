import { Building2, Landmark, Home, Users, GraduationCap, Handshake, Gem } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'

const AUDIENCES = [
  {
    icon: Building2,
    title: 'Doanh nghiệp',
    desc: 'Company trip, hội nghị và sự kiện gắn kết đội ngũ — đúng ngân sách, đúng mục tiêu kinh doanh.',
  },
  {
    icon: Landmark,
    title: 'Cơ quan / Tổ chức',
    desc: 'Đoàn công tác, hội thảo và chương trình đối ngoại đạt chuẩn quy trình, hợp đồng và báo cáo.',
  },
  {
    icon: Home,
    title: 'Gia đình',
    desc: 'Kỳ nghỉ nhiều thế hệ, nhịp độ và điểm đến được chọn riêng cho từng thành viên.',
  },
  {
    icon: Users,
    title: 'Nhóm bạn',
    desc: 'Hành trình trải nghiệm, lịch trình linh hoạt, phù hợp ngân sách chung của nhóm.',
  },
  {
    icon: GraduationCap,
    title: 'Trường học',
    desc: 'Tour học tập, ngoại khóa — đảm bảo an toàn và đúng mục tiêu giáo dục.',
  },
  {
    icon: Handshake,
    title: 'Hiệp hội',
    desc: 'Đại hội thành viên, hoạt động kết nối cộng đồng ngành nghề.',
  },
  {
    icon: Gem,
    title: 'Đoàn khách VIP',
    desc: 'Hành trình riêng tư, dịch vụ cao cấp, điều phối tận nơi xuyên suốt chuyến đi.',
  },
] as const

export function AudienceSection() {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Thiết kế cho ai"
          title="Mỗi đoàn khách một câu chuyện riêng"
          description="Dù là 20 hay 2.000 người, chương trình luôn được dựng lại từ đầu theo đúng đối tượng của bạn — không dùng một khuôn mẫu chung."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => {
            const Icon = a.icon
            return (
              <Reveal key={a.title} delay={i * 60}>
                <div className="group flex h-full flex-col gap-4 rounded-2xl border border-mv-border-soft bg-card p-6 transition-all duration-mv-normal hover:-translate-y-0.5 hover:border-mv-sky-cyan hover:shadow-soft-lg">
                  <span className="grid size-12 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue transition-colors group-hover:bg-mv-journey-blue group-hover:text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-mv-deep-navy">{a.title}</h3>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-mv-slate">{a.desc}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
