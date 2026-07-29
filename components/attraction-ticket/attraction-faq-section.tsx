import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'

export type AttractionFaqItem = { id: string; question: string; answer: string }

/**
 * General "how buying works here" FAQ for the landing page — distinct
 * from `attraction_faqs` (per-product, shown on product detail pages).
 * Content here is process/policy fact about Minh Việt's own checkout flow
 * (guest checkout, e-ticket delivery) — nothing about any specific venue's
 * inventory, so nothing here can go stale when products change.
 */
const GENERAL_FAQS: AttractionFaqItem[] = [
  {
    id: 'guest-checkout',
    question: 'Tôi có cần tạo tài khoản để đặt vé không?',
    answer: 'Không cần. Bạn có thể đặt vé trực tiếp bằng thông tin liên hệ (họ tên, số điện thoại, email) mà không cần đăng ký tài khoản.',
  },
  {
    id: 'eticket',
    question: 'Vé điện tử sử dụng như thế nào?',
    answer: 'Sau khi thanh toán thành công, vé điện tử được gửi qua email/SMS. Xuất trình mã vé (trên điện thoại hoặc bản in) tại cổng soát vé để quét và vào cổng.',
  },
  {
    id: 'cancellation',
    question: 'Chính sách hủy/đổi vé như thế nào?',
    answer: 'Chính sách hủy và đổi ngày sử dụng khác nhau theo từng khu vui chơi — xem chi tiết ở mục "Chính sách" trên trang vé bạn chọn trước khi đặt.',
  },
  {
    id: 'support',
    question: 'Nếu gặp sự cố khi đặt vé thì liên hệ ai?',
    answer: 'Gọi hotline hỗ trợ của Minh Việt Travel hiển thị ở chân trang, hoặc dùng mã đơn hàng đã nhận qua email để được hỗ trợ tra cứu nhanh.',
  },
]

export function AttractionFaqSection() {
  return (
    <section className="bg-mv-ice-blue/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Câu hỏi thường gặp" title="Những điều bạn hay thắc mắc" align="center" className="mx-auto max-w-2xl" />

        <Reveal className="mx-auto mt-10 max-w-3xl">
          <Accordion className="rounded-2xl bg-card px-6 shadow-soft">
            {GENERAL_FAQS.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionPanel>{item.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
