import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getComboLandingContent,
  getPublishedCombos,
  filterCombos,
  paginateCombos,
} from '@/lib/combo/combo-repository'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { ComboCard } from '@/components/combo/combo-card'

export const metadata: Metadata = {
  title: 'Tất cả Combo du lịch | Minh Việt Travel',
  description: 'Toàn bộ Combo du lịch trọn gói hiện có của Minh Việt — vé máy bay, khách sạn và lịch trình trong một mức giá.',
  alternates: { canonical: '/combo/tat-ca' },
}

interface ComboListSearchParams {
  category?: string
  destination?: string
  page?: string
}

/**
 * Minimal full-listing page — deliberately scoped down per the brief:
 * reuses `ComboCard` as-is, plain `searchParams`-based pagination (no
 * new client-state architecture), no booking engine, no inventory, no
 * dynamic pricing. Exists purely so Section 01's "Xem tất cả Combo" CTA
 * never resolves to a dead link.
 */
export default async function ComboListPage({
  searchParams,
}: {
  searchParams: Promise<ComboListSearchParams>
}) {
  const { category, destination, page: pageParam } = await searchParams
  const content = await getComboLandingContent()
  const allPublished = getPublishedCombos(content)
  const filtered = filterCombos(allPublished, { category, destination })
  const { items, page, totalPages, totalItems } = paginateCombos(filtered, Number(pageParam) || 1)

  const activeCategory = category ? content.categories.find((c) => c.id === category) : undefined
  const activeFilterLabel = activeCategory?.label ?? destination

  function pageHref(targetPage: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (destination) params.set('destination', destination)
    if (targetPage > 1) params.set('page', String(targetPage))
    const qs = params.toString()
    return qs ? `/combo/tat-ca?${qs}` : '/combo/tat-ca'
  }

  return (
    <SiteChrome>
      <section className="border-b border-mv-border-soft bg-mv-ice-blue/40 py-14 lg:py-16">
        <div className="container-mv">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/combo" className="transition-colors hover:text-mv-journey-blue">
              Combo
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Tất cả Combo</span>
          </nav>

          <SectionHeading
            eyebrow="Toàn bộ Combo"
            title={activeFilterLabel ? `Combo ${activeFilterLabel}` : 'Tất cả Combo du lịch'}
            description={`${totalItems} hành trình đã sẵn sàng để đặt.`}
          />

          {activeFilterLabel && (
            <Link href="/combo/tat-ca" className="link-underline mt-4 inline-block text-sm font-semibold text-mv-journey-blue">
              Xóa bộ lọc
            </Link>
          )}
        </div>
      </section>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-mv">
          {items.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              Chưa có Combo nào phù hợp. <Link href="/combo/tat-ca" className="text-mv-journey-blue hover:underline">Xem tất cả Combo</Link>.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Phân trang">
              <Link
                href={pageHref(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={cn(
                  'grid size-10 place-items-center rounded-full border border-mv-border-soft text-mv-deep-navy transition-colors hover:border-mv-journey-blue hover:text-mv-journey-blue',
                  page === 1 && 'pointer-events-none opacity-40',
                )}
              >
                <ChevronLeft className="size-4" />
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={cn(
                    'grid size-10 place-items-center rounded-full border text-sm font-semibold transition-colors',
                    p === page
                      ? 'border-mv-journey-blue bg-mv-journey-blue text-white'
                      : 'border-mv-border-soft text-mv-deep-navy hover:border-mv-journey-blue hover:text-mv-journey-blue',
                  )}
                >
                  {p}
                </Link>
              ))}
              <Link
                href={pageHref(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={cn(
                  'grid size-10 place-items-center rounded-full border border-mv-border-soft text-mv-deep-navy transition-colors hover:border-mv-journey-blue hover:text-mv-journey-blue',
                  page === totalPages && 'pointer-events-none opacity-40',
                )}
              >
                <ChevronRight className="size-4" />
              </Link>
            </nav>
          )}
        </div>
      </section>
    </SiteChrome>
  )
}
