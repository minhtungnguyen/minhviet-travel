import { CableCar, Gamepad2, LayoutGrid, PawPrint, Sparkles, Users, Waves, type LucideIcon } from 'lucide-react'

/**
 * Maps `attraction_categories.icon_key` (a short DB-stored string, never
 * raw SVG/markup — docs/design/mv-ticket/08-iconography.md §3) to a Lucide
 * component. Add a new entry here whenever a new category is seeded; an
 * unknown key falls back to `LayoutGrid` rather than throwing, since this
 * renders on the public homepage.
 */
export const ATTRACTION_CATEGORY_ICONS: Record<string, LucideIcon> = {
  waves: Waves,
  'cable-car': CableCar,
  sparkles: Sparkles,
  'paw-print': PawPrint,
  'gamepad-2': Gamepad2,
  users: Users,
}

export function getAttractionCategoryIcon(iconKey: string): LucideIcon {
  return ATTRACTION_CATEGORY_ICONS[iconKey] ?? LayoutGrid
}
