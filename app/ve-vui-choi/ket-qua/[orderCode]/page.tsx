import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, Download, Phone, XCircle } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { MVButton } from '@/components/mv/mv-button'
import { AttractionOrderLookupForm } from '@/components/attraction-ticket/attraction-order-lookup-form'
import { getGuestBookingService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { formatVnd } from '@/lib/flight/flight-format'
import type { AttractionOrderStatus } from '@/modules/attraction-ticket/domain/types'

export const metadata: Metadata = {
  title: 'Kết quả đặt vé | Minh Việt Travel',
  robots: { index: false, follow: false },
}

const STATUS_CONTENT: Record<AttractionOrderStatus, { icon: typeof CheckCircle2; label: string; tone: string; message: string }> = {
  INITIATED: { icon: Clock, label: 'Đang xử lý', tone: 'text-muted-foreground', message: 'Đơn hàng đang được khởi tạo. Vui lòng tải lại trang sau ít phút.' },
  PENDING_PAYMENT: { icon: Clock, label: 'Đang chờ xác nhận thanh toán', tone: 'text-warning', message: 'Đơn hàng đã được ghi nhận, đang chờ xác nhận thanh toán từ nhà cung cấp.' },
  CONFIRMED: { icon: Clock, label: 'Đã xác nhận', tone: 'text-mv-journey-blue', message: 'Thanh toán đã xác nhận, hệ thống đang xuất vé điện tử cho bạn.' },
  VOUCHER_ISSUED: { icon: CheckCircle2, label: 'Đặt vé thành công', tone: 'text-success', message: 'Vé điện tử đã sẵn sàng — xem hoặc tải vé bên dưới.' },
  FAILED: { icon: XCircle, label: 'Đặt vé thất bại', tone: 'text-destructive', message: 'Rất tiếc, đơn hàng không thể hoàn tất. Vui lòng liên hệ hotline để được hỗ trợ.' },
  CANCELLED: { icon: XCircle, label: 'Đơn hàng đã hủy', tone: 'text-muted-foreground', message: 'Đơn hàng này đã được hủy.' },
}

export default async function AttractionTicketOrderResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderCode: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const { orderCode } = await params
  const { email } = await searchParams

  if (!email) {
    return (
      <SiteChrome>
        <section className="container-mv py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-mv-deep-navy">Tra cứu đơn hàng {orderCode}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Nhập email đã dùng khi đặt vé để xem chi tiết đơn hàng.</p>
          <AttractionOrderLookupForm orderCode={orderCode} />
        </section>
      </SiteChrome>
    )
  }

  const service = getGuestBookingService()
  let result
  try {
    result = await service.getBookingForCustomer(orderCode, email)
  } catch {
    result = null
  }

  if (!result) {
    return (
      <SiteChrome>
        <section className="container-mv py-20 text-center">
          <XCircle className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold text-mv-deep-navy">Không tìm thấy đơn hàng</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mã đơn <strong>{orderCode}</strong> và email <strong>{email}</strong> không khớp với đơn hàng nào. Vui lòng kiểm tra lại.
          </p>
          <AttractionOrderLookupForm orderCode={orderCode} />
        </section>
      </SiteChrome>
    )
  }

  const { order, items, vouchers } = result
  const status = STATUS_CONTENT[order.status]
  const StatusIcon = status.icon
  const voucher = vouchers[0]

  return (
    <SiteChrome>
      <section className="bg-mv-ice-blue/40 py-14 lg:py-16">
        <div className="container-mv max-w-2xl">
          <div className="rounded-2xl bg-card p-6 text-center shadow-soft sm:p-10">
            <StatusIcon className={`mx-auto size-12 ${status.tone}`} />
            <h1 className="mt-4 font-display text-2xl font-bold text-mv-deep-navy sm:text-3xl">{status.label}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{status.message}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-mv-ice-blue/50 p-4 text-left text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Mã đơn Minh Việt</p>
                <p className="font-semibold text-foreground">{order.orderCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng tiền</p>
                <p className="font-semibold text-foreground">{formatVnd(order.totalAmount)}</p>
              </div>
              {items[0] && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày sử dụng</p>
                    <p className="font-semibold text-foreground">{items[0].usageDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Số lượng</p>
                    <p className="font-semibold text-foreground">{items[0].quantity} vé</p>
                  </div>
                </>
              )}
            </div>

            {voucher?.downloadUrl && (
              <MVButton href={voucher.downloadUrl} variant="accent" size="lg" className="mt-6 w-full">
                <Download className="size-4" /> Xem / Tải vé điện tử
              </MVButton>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-center">
              <a href="tel:19001234" className="inline-flex items-center justify-center gap-1.5 font-semibold text-mv-journey-blue">
                <Phone className="size-4" /> Hotline hỗ trợ 1900 1234
              </a>
              <span className="hidden text-border sm:inline">·</span>
              <Link href="/ve-vui-choi" className="font-semibold text-mv-journey-blue hover:underline">
                Tiếp tục xem vé khác
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
