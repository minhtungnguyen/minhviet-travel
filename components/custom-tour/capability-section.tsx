import { UserCheck, Network, HeartHandshake, Wallet, Radio, LifeBuoy, ClipboardCheck } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { VerifiedStat } from '@/components/homepage/verified-stat'

const CAPABILITIES = [
  { icon: UserCheck, title: 'Một đầu mối điều phối', desc: 'Một chuyên viên đồng hành xuyên suốt, không bàn giao giữa chừng.' },
  { icon: Network, title: 'Hệ thống nhà cung cấp', desc: 'Mạng lưới khách sạn, vận chuyển, MC và đối tác sự kiện đã được thẩm định.' },
  { icon: HeartHandshake, title: 'Hỗ trợ trước / trong / sau', desc: 'Đồng hành từ lúc lên ý tưởng đến khi hành trình kết thúc.' },
  { icon: Wallet, title: 'Kiểm soát ngân sách', desc: 'Báo giá minh bạch theo hạng mục, không phát sinh ẩn.' },
  { icon: Radio, title: 'Điều phối đoàn', desc: 'Đội ngũ tại chỗ theo sát lịch trình và số lượng khách thực tế.' },
  { icon: LifeBuoy, title: 'Xử lý tình huống', desc: 'Phương án dự phòng cho thay đổi thời tiết, lịch trình hoặc yêu cầu phát sinh.' },
  { icon: ClipboardCheck, title: 'Nghiệm thu', desc: 'Đánh giá kết quả sau chương trình cùng đơn vị tổ chức.' },
] as const

/**
 * Every number here is pulled from the same CMS content homepage already
 * renders (`hero.proofStat`, `enterpriseMice.proofStat`, `trustStrip.stats`)
 * — reused, not invented, so there is exactly one source of truth and no
 * risk of this page quietly drifting from the homepage's verified figures.
 */
export async function CapabilitySection() {
  const { hero, enterpriseMice, trustStrip } = await getHomepageContent()
  const stats = [hero.proofStat, enterpriseMice.proofStat, trustStrip.stats[0]].filter(Boolean)

  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-deep-navy">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Năng lực tổ chức"
          title="Đủ kinh nghiệm để tổ chức, đủ tận tâm để lắng nghe"
          onDark
          className="max-w-2xl"
        />

        {stats.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-white/10 pb-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <VerifiedStat key={stat.id} stat={stat} onDark />
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon
            return (
              <Reveal key={c.title} delay={(i % 4) * 60}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-mv-sky-cyan">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-paper">{c.title}</h3>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-paper/65">{c.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
