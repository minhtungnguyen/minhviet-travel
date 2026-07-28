'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Building2, CalendarDays, LayoutGrid, Loader2, MapPin, Search, Ticket, X } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatVnd } from '@/lib/flight/flight-format'
import { searchAttractionCatalog, type AttractionSearchCatalog } from '@/lib/attraction-ticket/search-attraction-catalog'

export type AttractionSearchFeaturedVenue = { slug: string; name: string; destinationSlug: string }

type SuggestionGroupKey = 'venue' | 'destination' | 'category' | 'product'

type Suggestion = {
  id: string
  groupKey: SuggestionGroupKey
  label: string
  meta?: string
  href: string
}

type SuggestionGroup = { key: SuggestionGroupKey; items: Suggestion[] }

const GROUP_ICON: Record<SuggestionGroupKey, typeof Building2> = {
  venue: Building2,
  destination: MapPin,
  category: LayoutGrid,
  product: Ticket,
}

const TYPED_GROUP_LABEL: Record<SuggestionGroupKey, string> = {
  venue: 'Thương hiệu',
  destination: 'Điểm đến',
  category: 'Loại trải nghiệm',
  product: 'Sản phẩm',
}

const EMPTY_STATE_GROUP_LABEL: Record<SuggestionGroupKey, string> = {
  venue: 'Thương hiệu nổi bật',
  destination: 'Điểm đến phổ biến',
  category: 'Danh mục nổi bật',
  product: 'Sản phẩm', // not used in empty state (no popularity signal to show it honestly — see buildEmptyStateGroups)
}

function buildTypedGroups(result: ReturnType<typeof searchAttractionCatalog>): SuggestionGroup[] {
  const groups: SuggestionGroup[] = [
    {
      key: 'venue',
      items: result.venues.map((venue) => ({
        id: `venue:${venue.slug}`,
        groupKey: 'venue' as const,
        label: venue.name,
        meta: `${venue.productCount} trải nghiệm`,
        href: `/ve-vui-choi/${venue.destinationSlug}`,
      })),
    },
    {
      key: 'destination',
      items: result.destinations.map((destination) => ({
        id: `destination:${destination.slug}`,
        groupKey: 'destination' as const,
        label: destination.name,
        href: `/ve-vui-choi/${destination.slug}`,
      })),
    },
    {
      key: 'category',
      items: result.categories.map((category) => ({
        id: `category:${category.slug}`,
        groupKey: 'category' as const,
        label: category.name,
        href: `/ve-vui-choi/tat-ca?category=${encodeURIComponent(category.slug)}`,
      })),
    },
    {
      key: 'product',
      items: result.products.map((product) => ({
        id: `product:${product.slug}`,
        groupKey: 'product' as const,
        label: product.title,
        meta: `${product.venueName} · ${product.destinationName}${product.priceFrom !== null ? ` · ${formatVnd(product.priceFrom)}` : ''}`,
        href: `/ve-vui-choi/${product.destinationSlug}/${product.slug}`,
      })),
    },
  ]
  return groups.filter((group) => group.items.length > 0)
}

/**
 * No `product` group here on purpose — there is no popularity/ranking
 * signal for individual products (no view/booking-count column), so
 * showing "popular products" here would be fabricated ranking, not real
 * data. `venue`/`destination`/`category` are real, bounded lists (featured
 * flag, published rows, taxonomy) so they're honest to surface before the
 * user types anything. "Tìm kiếm phổ biến" (recent/popular search terms)
 * is omitted entirely for the same reason — no search-analytics table
 * exists yet to back that claim (brief §5 allows this group but says
 * "có thể", not "phải").
 */
function buildEmptyStateGroups(catalog: AttractionSearchCatalog, featuredVenues: AttractionSearchFeaturedVenue[]): SuggestionGroup[] {
  const groups: SuggestionGroup[] = [
    {
      key: 'venue',
      items: featuredVenues.slice(0, 4).map((venue) => ({
        id: `venue:${venue.slug}`,
        groupKey: 'venue' as const,
        label: venue.name,
        href: `/ve-vui-choi/${venue.destinationSlug}`,
      })),
    },
    {
      key: 'destination',
      items: catalog.destinations.slice(0, 4).map((destination) => ({
        id: `destination:${destination.slug}`,
        groupKey: 'destination' as const,
        label: destination.name,
        href: `/ve-vui-choi/${destination.slug}`,
      })),
    },
    {
      key: 'category',
      items: catalog.categories.slice(0, 6).map((category) => ({
        id: `category:${category.slug}`,
        groupKey: 'category' as const,
        label: category.name,
        href: `/ve-vui-choi/tat-ca?category=${encodeURIComponent(category.slug)}`,
      })),
    },
  ]
  return groups.filter((group) => group.items.length > 0)
}

/**
 * Marketplace keyword search — replaces the previous destination-only
 * `<select>` (that UI was a destination selector, not search; see
 * docs/reviews search-box-redesign audit). Keyword is the primary field;
 * "Điểm đến" and "Ngày" are secondary filters alongside it, never a
 * default value inside the keyword field itself.
 *
 * Matching runs entirely client-side over `searchCatalog` (already fetched
 * server-side for this same page render — no extra network round-trip, no
 * new API surface). Debounce only smooths the perceived typing experience;
 * it isn't hiding request latency since there is no request.
 */
export function AttractionTicketSearchBox({
  searchCatalog,
  featuredVenues,
}: {
  searchCatalog: AttractionSearchCatalog
  featuredVenues: AttractionSearchFeaturedVenue[]
}) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [destinationSlug, setDestinationSlug] = useState('')
  const [date, setDate] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; width: number } | null>(null)

  const debouncedQuery = useDebouncedValue(query, 250)
  const isQueryEmpty = debouncedQuery.trim() === ''
  const isPending = query.trim() !== '' && debouncedQuery !== query

  const matchResult = useMemo(() => searchAttractionCatalog(searchCatalog, debouncedQuery), [searchCatalog, debouncedQuery])
  const groups = useMemo(
    () => (isQueryEmpty ? buildEmptyStateGroups(searchCatalog, featuredVenues) : buildTypedGroups(matchResult)),
    [isQueryEmpty, searchCatalog, featuredVenues, matchResult],
  )
  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups])
  const noResults = !isQueryEmpty && !isPending && flatItems.length === 0
  const activeItem = flatItems[activeIndex] ?? null
  const groupLabelOf = (key: SuggestionGroupKey) => (isQueryEmpty ? EMPTY_STATE_GROUP_LABEL[key] : TYPED_GROUP_LABEL[key])

  useEffect(() => {
    if (!isOpen) return
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
      if (listboxRef.current?.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  // The dropdown is portaled to `document.body` (fixed-positioned, tracking
  // the form's own rect) rather than rendered inline — the Hero section it
  // lives in has `overflow-hidden` (needed to clip its full-bleed background
  // photo), which would otherwise silently clip the suggestion list once it
  // grew past the hero's box. Recomputed on open, resize and scroll (capture
  // phase, since the page itself is what scrolls here) so it never drifts.
  useEffect(() => {
    if (!isOpen) return
    function updateAnchorRect() {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setAnchorRect({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
    updateAnchorRect()
    window.addEventListener('resize', updateAnchorRect)
    window.addEventListener('scroll', updateAnchorRect, true)
    return () => {
      window.removeEventListener('resize', updateAnchorRect)
      window.removeEventListener('scroll', updateAnchorRect, true)
    }
  }, [isOpen])

  function handleSelect(item: Suggestion) {
    setIsOpen(false)
    router.push(item.href)
  }

  function handleClear() {
    setQuery('')
    setActiveIndex(0)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') setIsOpen(true)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (flatItems.length === 0 ? 0 : (index + 1) % flatItems.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (flatItems.length === 0 ? 0 : (index - 1 + flatItems.length) % flatItems.length))
    } else if (event.key === 'Enter') {
      if (activeItem) {
        event.preventDefault()
        handleSelect(activeItem)
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsOpen(false)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (destinationSlug) params.set('destination', destinationSlug)
    if (date) params.set('date', date)
    const qs = params.toString()
    router.push(`/ve-vui-choi/tat-ca${qs ? `?${qs}` : ''}`)
  }

  return (
    <div ref={containerRef} data-search-box className="relative w-full max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-2 rounded-2xl bg-paper/95 p-2.5 shadow-soft-lg backdrop-blur-sm sm:flex-row sm:items-center sm:gap-0 sm:p-2"
      >
        <div className="relative flex flex-1 items-center gap-2 rounded-xl border border-mv-border-soft px-3 py-1 sm:border-0 sm:px-3.5">
          <Search className="size-4.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="attraction-search-listbox"
            aria-activedescendant={isOpen && activeItem ? activeItem.id : undefined}
            aria-autocomplete="list"
            aria-label="Tìm khu vui chơi, show, cáp treo, safari"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm khu vui chơi, show, cáp treo, safari..."
            autoComplete="off"
            className="h-10 w-full min-w-0 border-0 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xóa từ khóa"
              className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-mv-mist-blue hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:contents">
          <label className="relative flex items-center gap-2 rounded-xl border border-mv-border-soft px-3 py-1 sm:w-40 sm:shrink-0 sm:rounded-none sm:border-0 sm:border-l sm:border-mv-border-soft sm:px-3.5">
            <span className="sr-only">Điểm đến</span>
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <select
              value={destinationSlug}
              onChange={(event) => setDestinationSlug(event.target.value)}
              className="h-10 w-full min-w-0 appearance-none border-0 bg-transparent text-sm font-medium text-foreground outline-none"
            >
              <option value="">Điểm đến</option>
              {searchCatalog.destinations.map((destination) => (
                <option key={destination.slug} value={destination.slug}>
                  {destination.name}
                </option>
              ))}
            </select>
          </label>

          <label className="relative flex items-center gap-2 rounded-xl border border-mv-border-soft px-3 py-1 sm:w-36 sm:shrink-0 sm:rounded-none sm:border-0 sm:border-l sm:border-mv-border-soft sm:px-3.5">
            <span className="sr-only">Ngày</span>
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 w-full min-w-0 border-0 bg-transparent text-sm font-medium text-foreground outline-none [color-scheme:light]"
            />
          </label>
        </div>

        <MVButton type="submit" variant="accent" size="lg" className="w-full shrink-0 bg-mv-ticket-orange hover:bg-mv-ticket-orange/90 sm:ml-2 sm:w-auto">
          <Search className="size-4" />
          Tìm kiếm
        </MVButton>
      </form>

      {isOpen &&
        anchorRect &&
        createPortal(
          <div
            ref={listboxRef}
            id="attraction-search-listbox"
            role="listbox"
            aria-label="Gợi ý tìm kiếm"
            style={{ position: 'fixed', top: anchorRect.top, left: anchorRect.left, width: anchorRect.width }}
            className="z-50 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-border bg-card p-2 text-left shadow-soft-lg"
          >
          {isPending ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tìm...
            </div>
          ) : noResults ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <p>
                Không tìm thấy kết quả cho &ldquo;{debouncedQuery}&rdquo;.
              </p>
              <Link href="/ve-vui-choi/tat-ca" className="mt-2 inline-block font-semibold text-mv-journey-blue hover:underline">
                Xem tất cả vé vui chơi
              </Link>
            </div>
          ) : groups.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Chưa có gợi ý nào.</div>
          ) : (
            groups.map((group) => {
              const Icon = GROUP_ICON[group.key]
              return (
                <div key={group.key} role="group" aria-labelledby={`attraction-search-group-${group.key}`} className="mb-1 last:mb-0">
                  <p
                    id={`attraction-search-group-${group.key}`}
                    className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {groupLabelOf(group.key)}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      id={item.id}
                      role="option"
                      aria-selected={item.id === activeItem?.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(flatItems.findIndex((flatItem) => flatItem.id === item.id))}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        item.id === activeItem?.id ? 'bg-mv-mist-blue' : 'hover:bg-mv-mist-blue/60',
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-mv-journey-blue" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">{item.label}</span>
                        {item.meta && <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )
            })
          )}
          </div>,
          document.body,
        )}
    </div>
  )
}
