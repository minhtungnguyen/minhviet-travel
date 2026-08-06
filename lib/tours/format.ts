import type { TourDepartureStatus } from '@/modules/tour-departures/domain/types'

export function formatTourPrice(price: number | null): string {
  if (price == null) return 'Liên hệ'
  return `${price.toLocaleString('vi-VN')}₫`
}

export function formatTourDate(iso: string | null): string {
  if (!iso) return 'Đang cập nhật'
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function formatSeatsLabel(seatsAvailable: number | null, status: TourDepartureStatus | null): string {
  if (seatsAvailable != null) return `Còn ${seatsAvailable} chỗ`
  if (status === 'CLOSED') return 'Hết chỗ'
  return 'Liên hệ để biết số chỗ còn lại'
}

export const TOUR_AVAILABILITY_COPY: Record<TourDepartureStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'info' }> = {
  OPEN: { label: 'Còn nhận khách', variant: 'success' },
  LIMITED: { label: 'Sắp hết chỗ', variant: 'warning' },
  ALMOST_FULL: { label: 'Gần kín', variant: 'warning' },
  CLOSED: { label: 'Hết chỗ', variant: 'neutral' },
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận', variant: 'info' },
}
