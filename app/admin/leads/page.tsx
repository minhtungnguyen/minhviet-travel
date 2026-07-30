import type { Metadata } from 'next'
import { ComingSoon } from '@/components/admin/coming-soon'

export const metadata: Metadata = { title: 'Leads | Minh Việt Travel Admin' }

export default function AdminLeadsPage() {
  return <ComingSoon title="Leads" />
}
