import type { BenefitLimitValue } from '@/types/insurance'

function formatMoney(amount: number, currency: 'usd' | 'vnd'): string {
  if (currency === 'usd') return `${amount.toLocaleString('en-US')} USD`
  return `${amount.toLocaleString('vi-VN')} đ`
}

/** Shared by `insurance-benefits-section.tsx` and `insurance-compare-table.tsx` so the 3 possible states render identically everywhere. */
export function formatBenefitLimit(value: BenefitLimitValue, currency: 'usd' | 'vnd'): string {
  if (value.kind === 'included') return 'Bao gồm'
  if (value.kind === 'not_applicable') return '—'
  return formatMoney(value.value[currency], currency)
}
