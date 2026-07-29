import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAttractionCategoryIcon } from '@/components/attraction-ticket/attraction-category-icon'

export type AttractionCategoryChip = { slug: string; name: string; iconKey: string }

/**
 * Rendered inside the Hero panel (Concept 5, docs/design/mv-ticket/02-
 * homepage-and-listing-concept.md §1.3, D8) so Search + Category share the
 * same first viewport on desktop. Chip color is Minh Việt Blue, never
 * Orange (D1, docs/design/DESIGN-BIBLE-v1.0.md §3 — Orange is reserved for
 * the "money/action" signal only). "Tất cả" defaults active since this
 * renders on the unfiltered homepage; the Listing page's own filter bar
 * (Sprint/Bước 6) handles real active-state selection.
 */
export function AttractionCategoryChips({ categories }: { categories: AttractionCategoryChip[] }) {
  if (categories.length === 0) return null

  return (
    <nav aria-label="Loại hình vui chơi" className="flex w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/ve-vui-choi/tat-ca"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-mv-journey-blue px-3.5 py-2 text-xs font-semibold text-white transition-colors"
      >
        <LayoutGrid className="size-3.5" />
        Tất cả
      </Link>
      {categories.map((category) => {
        const Icon = getAttractionCategoryIcon(category.iconKey)
        return (
          <Link
            key={category.slug}
            href={`/ve-vui-choi/tat-ca?category=${encodeURIComponent(category.slug)}`}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors',
              'bg-mv-mist-blue text-mv-deep-navy hover:bg-mv-journey-blue hover:text-white',
            )}
          >
            <Icon className="size-3.5" />
            {category.name}
          </Link>
        )
      })}
    </nav>
  )
}
