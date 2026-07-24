import { ClipboardList, Target, Lightbulb, PenTool, Calculator, CheckCheck } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Tiếp nhận nhu cầu',
    desc: 'Lắng nghe mục tiêu, đối tượng, số lượng khách, ngân sách và thời gian dự kiến của bạn.',
  },
  {
    icon: Target,
    title: 'Phân tích mục tiêu',
    desc: 'Xác định trọng tâm chuyến đi: gắn kết đội ngũ, đối ngoại, tri ân khách hàng hay nghỉ dưỡng gia đình.',
  },
  {
    icon: Lightbulb,
    title: 'Xây dựng concept',
    desc: 'Phác thảo ý tưởng chủ đề, điểm đến và nhịp độ hành trình phù hợp với mục tiêu đã xác định.',
  },
  {
    icon: PenTool,
    title: 'Thiết kế chương trình',
    desc: 'Hoàn thiện lịch trình chi tiết: di chuyển, lưu trú, hoạt động, ẩm thực và các dịch vụ đi kèm.',
  },
  {
    icon: Calculator,
    title: 'Báo giá và điều chỉnh',
    desc: 'Gửi báo giá minh bạch theo từng hạng mục, điều chỉnh theo phản hồi cho đến khi bạn hài lòng.',
  },
  {
    icon: CheckCheck,
    title: 'Tổ chức và nghiệm thu',
    desc: 'Vận hành trọn gói, điều phối tại chỗ xuyên suốt hành trình và nghiệm thu sau khi kết thúc.',
  },
] as const

export function ProcessSection() {
  return (
    <section id="quy-trinh" className="section-py-md scroll-mt-20 border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Quy trình"
          title="Sáu bước, một đầu mối đồng hành"
          description="Không bàn giao giữa chừng — cùng một đội ngũ theo sát chương trình từ ý tưởng đầu tiên đến ngày nghiệm thu."
          className="max-w-2xl"
        />

        <div className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Subtle connecting line — desktop 3-col rows only, not a technical flowchart. */}
          <div className="pointer-events-none absolute inset-x-0 top-6 hidden border-t border-dashed border-mv-border-soft lg:block" aria-hidden />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={i * 70}>
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-mv-deep-navy text-paper shadow-soft">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-display text-2xl font-extrabold text-mv-border-soft">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-mv-deep-navy">{step.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-mv-slate">{step.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
