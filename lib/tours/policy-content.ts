/**
 * Company-wide payment/cancellation terms — not per-tour, so kept as one
 * shared constant rather than duplicated block content on every Tour page.
 * Sprint 7 Phase 6: this file used to also hold `rawTourDetailContent`, a
 * hardcoded per-tour gallery/itinerary/inclusions map keyed by tour id —
 * that data now lives for real in the CMS (`cms_sections`/`cms_blocks` via
 * `lib/tours/public-tours.ts`), so only the genuinely tour-agnostic
 * constants below remain.
 */

export type CancellationTier = { label: string; detail: string }

export const standardPaymentPolicy: string[] = [
  'Đặt cọc 30% giá trị chương trình ngay khi đăng ký để giữ chỗ.',
  'Thanh toán đủ 100% chậm nhất 15 ngày trước ngày khởi hành.',
  'Đặt cọc và thanh toán được xác nhận bằng phiếu thu hoặc hợp đồng dịch vụ chính thức từ Minh Việt Travel.',
  'Giá có thể điều chỉnh khi tỷ giá, thuế hoặc phụ phí nhiên liệu biến động — mọi thay đổi được thông báo trước khi xuất vé/xác nhận dịch vụ.',
]

export const standardCancellationPolicy: CancellationTier[] = [
  { label: 'Trước 30 ngày khởi hành', detail: 'Hoàn 90% (giữ lại 10% phí xử lý)' },
  { label: '15 – 29 ngày', detail: 'Hoàn 50%' },
  { label: '7 – 14 ngày', detail: 'Hoàn 30%' },
  { label: 'Dưới 7 ngày hoặc không khởi hành', detail: 'Không hoàn tiền cọc' },
]

export const cancellationPolicyNote =
  'Chính sách áp dụng cho trường hợp huỷ từ phía khách hàng. Trường hợp bất khả kháng (thiên tai, dịch bệnh, chính sách nhà nước...) được xử lý theo thoả thuận cụ thể với chuyên viên phụ trách.'
