import type { Metadata } from 'next'
import { ComingSoon } from '@/components/admin/coming-soon'

export const metadata: Metadata = { title: 'Products | Minh Việt Travel Admin' }

export default function AdminProductsPage() {
  return <ComingSoon title="Products" />
}
