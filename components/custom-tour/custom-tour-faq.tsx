import Link from 'next/link'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'

/**
 * Flat {question, answer, answerText} array — `answer` is what renders
 * (plain string, or JSX for the 2 items with an inline internal link);
 * `answerText` is the same content as plain text only, which is what a
 * FAQPage JSON-LD generator needs later (schema markup itself isn't added
 * yet — see CUSTOM_TOUR_LANDING_PAGE.md "Remaining CMS/backend work").
 */
export const CUSTOM_TOUR_FAQ = [
  {
    question: 'Tour thiết kế riêng có giá như thế nào?',
    answer:
      'Không có bảng giá cố định — chi phí phụ thuộc điểm đến, thời gian, số lượng khách và các dịch vụ đi kèm. Sau khi tiếp nhận nhu cầu, Minh Việt gửi báo giá minh bạch theo từng hạng mục để bạn chủ động cân đối ngân sách.',
  },
  {
    question: 'Cần cung cấp những thông tin gì?',
    answer:
      'Mục tiêu chuyến đi, số lượng khách dự kiến, thời gian, ngân sách tham khảo và những yêu cầu đặc biệt (nếu có). Càng nhiều thông tin, chương trình đề xuất đầu tiên càng sát với nhu cầu thực tế.',
  },
  {
    question: 'Minh Việt có hỗ trợ xây dựng ngân sách không?',
    answer:
      'Có. Đội ngũ tư vấn sẽ đề xuất các phương án ở nhiều mức ngân sách khác nhau, giải thích rõ từng hạng mục để bạn dễ dàng trình duyệt nội bộ.',
  },
  {
    question: 'Có thể thay đổi lịch trình không?',
    answer:
      'Có. Lịch trình được điều chỉnh trong suốt bước "Báo giá và điều chỉnh" của quy trình, cho đến khi bạn hài lòng trước khi chốt chương trình.',
  },
  {
    question: 'Có tổ chức đoàn lớn không?',
    answer:
      'Có. Minh Việt tổ chức từ nhóm nhỏ vài chục người đến đoàn hàng nghìn khách cho các chương trình MICE và hội nghị quy mô lớn.',
  },
  {
    question: 'Có hỗ trợ MICE và Gala Dinner không?',
    answerText:
      'Có. Đây là một trong những thế mạnh chính của Minh Việt — từ hội nghị, hội thảo đến gala dinner theo chủ đề riêng, xem thêm tại trang Giải pháp MICE.',
    answer: (
      <>
        Có. Đây là một trong những thế mạnh chính của Minh Việt — từ hội nghị, hội thảo đến gala dinner theo chủ đề
        riêng, xem thêm tại{' '}
        <Link href="/mice" className="font-semibold text-mv-journey-blue hover:underline">
          trang Giải pháp MICE
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Có hỗ trợ vé máy bay, khách sạn và bảo hiểm không?',
    answerText:
      'Có. Đây là các hạng mục tùy chỉnh có thể tích hợp trực tiếp vào chương trình thiết kế riêng, song song với tour ghép quốc tế và tour đoàn có sẵn, không cần đặt tách lẻ ở nơi khác.',
    answer: (
      <>
        Có. Đây là các hạng mục tùy chỉnh có thể tích hợp trực tiếp vào chương trình thiết kế riêng, song song với{' '}
        <Link href="/tours" className="font-semibold text-mv-journey-blue hover:underline">
          tour ghép quốc tế
        </Link>{' '}
        và{' '}
        <Link href="/tours?type=group" className="font-semibold text-mv-journey-blue hover:underline">
          tour đoàn
        </Link>{' '}
        có sẵn, không cần đặt tách lẻ ở nơi khác.
      </>
    ),
  },
  {
    question: 'Thời gian lên chương trình mất bao lâu?',
    answer:
      'Tùy độ phức tạp, chương trình sơ bộ thường có trong vài ngày làm việc sau khi tiếp nhận đầy đủ thông tin. Đoàn lớn hoặc yêu cầu đặc biệt có thể cần thêm thời gian.',
  },
  {
    question: 'Có hỗ trợ sau khi ký hợp đồng không?',
    answer:
      'Có. Một đầu mối điều phối đồng hành xuyên suốt quá trình vận hành, xử lý phát sinh tại chỗ và nghiệm thu cùng bạn sau khi hành trình kết thúc.',
  },
] as const

export function CustomTourFAQ() {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader eyebrow="Câu hỏi thường gặp" title="Những điều khách hàng hay hỏi" className="max-w-2xl" />

        <Reveal className="mt-10 max-w-3xl">
          <Accordion className="rounded-2xl bg-card px-6 shadow-soft">
            {CUSTOM_TOUR_FAQ.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
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
