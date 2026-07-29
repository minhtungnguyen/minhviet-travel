import { ShieldCheck, Ticket, Wallet, Headset } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'

const COMMITMENTS = [
  {
    icon: Ticket,
    title: 'Vé điện tử tức thì',
    description: 'Xác nhận thanh toán xong, vé gửi ngay qua email/SMS — không cần đổi vé giấy tại quầy.',
  },
  {
    icon: Wallet,
    title: 'Giá minh bạch',
    description: 'Giá hiển thị đã là giá cuối cùng, không phụ phí ẩn phát sinh khi thanh toán.',
  },
  {
    icon: ShieldCheck,
    title: 'Đặt vé an toàn',
    description: 'Thông tin thanh toán được xử lý bảo mật, không lưu trữ dữ liệu thẻ trên hệ thống Minh Việt.',
  },
  {
    icon: Headset,
    title: 'Hỗ trợ khi cần',
    description: 'Đội ngũ Minh Việt hỗ trợ qua hotline nếu có vấn đề trước hoặc trong chuyến đi.',
  },
]

export function AttractionWhySection() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Cam kết dịch vụ" title="Vì sao đặt vé qua Minh Việt" align="center" />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMMITMENTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 60} className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mv-ice-blue text-mv-journey-blue">
                <item.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-mv-deep-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
