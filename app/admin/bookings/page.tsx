import type { Metadata } from 'next'
import { ComingSoon } from '@/components/admin/coming-soon'

export const metadata: Metadata = { title: 'Bookings | Minh Việt Travel Admin' }

export default function AdminBookingsPage() {
  return <ComingSoon title="Bookings" />
}
