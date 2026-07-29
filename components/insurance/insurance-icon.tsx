import { FileCheck2, Phone, PhoneCall, Plane, ShieldCheck, Umbrella, type LucideIcon } from 'lucide-react'

/**
 * Maps `InsuranceWhyBuyItem.icon` (a short string key, never raw SVG) to a
 * Lucide component — same convention as
 * `attraction-category-icon.tsx`. Insurance's brand rule (BRAND-002
 * §Insurance) restricts icons to shield/checkmark/umbrella-family line
 * icons only, never filled, never a "warning" red — an unknown key falls
 * back to `ShieldCheck` rather than throwing, since this renders on the
 * public landing page.
 */
export const INSURANCE_ICONS: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'file-check-2': FileCheck2,
  plane: Plane,
  'phone-call': PhoneCall,
  phone: Phone,
  umbrella: Umbrella,
}

export function getInsuranceIcon(iconKey: string): LucideIcon {
  return INSURANCE_ICONS[iconKey] ?? ShieldCheck
}
