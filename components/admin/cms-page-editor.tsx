'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowDown, ArrowUp } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import {
  submitForReviewAction,
  approvePageAction,
  publishPageAction,
  unpublishPageAction,
  archivePageAction,
  moveSectionAction,
  deletePageAction,
  type ActionResult,
} from '@/app/admin/cms/actions'
import { HeroBlockForm } from '@/components/admin/blocks/hero-block-form'
import { TrustStripBlockForm } from '@/components/admin/blocks/trust-strip-block-form'
import { NewsMetaBlockForm, type NewsMetaConfig } from '@/components/admin/blocks/news-meta-block-form'
import { CeoBlockForm } from '@/components/admin/blocks/ceo-block-form'
import { RichTextBlockForm, type RichTextConfig } from '@/components/admin/blocks/rich-text-block-form'
import { TourItineraryBlockForm, type TourItineraryConfig } from '@/components/admin/blocks/tour-itinerary-block-form'
import { TourPolicyBlockForm, type TourPolicyConfig } from '@/components/admin/blocks/tour-policy-block-form'
import { SeoMetadataForm } from '@/components/admin/seo-metadata-form'
import type { OgImageValue } from '@/components/admin/seo-og-image-picker'
import { NewsCategoryPicker } from '@/components/admin/news-category-picker'
import { TourCategoryPicker } from '@/components/admin/tour-category-picker'
import { TourDestinationPicker, type PickableDestination } from '@/components/admin/tour-destination-picker'
import { TourDeparturesForm } from '@/components/admin/tour-departures-form'
import type { CmsBlock, CmsBlockDefinition, CmsPage, CmsPageVersion, CmsSection } from '@/modules/cms/domain/types'
import type { SeoMetadata } from '@/modules/seo/domain/types'
import type { NewsCategory } from '@/modules/news-categories/domain/types'
import type { TourCategory } from '@/modules/tour-categories/domain/types'
import type { TourDeparture } from '@/modules/tour-departures/domain/types'
import type { HeroContent, TrustStripContent, CeoSectionContent } from '@/types/homepage'

/**
 * Real per-section-type edit forms for the sections named in Sprint 2
 * ("Hero Banner", "Statistics"/"Partner logos" — both live in the
 * `trustStrip` section — and "CEO/Lãnh đạo") plus Phase 4's `meta`
 * (News) and Sprint 6's `content` (News article body, reuses the
 * existing RICH_TEXT block definition), plus Sprint 7's `itinerary` and
 * `policy` (Tour). Every other block still falls through to the raw
 * JSON editor below until it gets a dedicated form.
 */
function BlockEditor({ pageId, sectionKey, block }: { pageId: string; sectionKey: string; block: CmsBlock }) {
  switch (sectionKey) {
    case 'hero':
      return <HeroBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as HeroContent} />
    case 'trustStrip':
      return <TrustStripBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as TrustStripContent} />
    case 'meta':
      return <NewsMetaBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as NewsMetaConfig} />
    case 'ceoSection':
      return <CeoBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as CeoSectionContent} />
    case 'content':
      return <RichTextBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as RichTextConfig} />
    case 'itinerary':
      return <TourItineraryBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as TourItineraryConfig} />
    case 'policy':
      return <TourPolicyBlockForm pageId={pageId} blockId={block.id} initial={block.config as unknown as TourPolicyConfig} />
    default:
      return <pre className="overflow-x-auto text-xs text-foreground/80">{JSON.stringify(block.config, null, 2)}</pre>
  }
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  SCHEDULED: 'Đã lên lịch',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Đã lưu trữ',
}

export function CmsPageEditor({
  page,
  currentVersion,
  sectionsWithBlocks,
  blockDefinitions,
  canUpdate,
  canPublish,
  canDelete,
  canWriteSeo,
  seoMetadata,
  initialOgImage,
  newsCategories,
  currentCategoryId,
  tourCategories,
  currentTourCategoryIds,
  tourDestinations,
  currentTourDestinationIds,
  tourDepartures,
}: {
  page: CmsPage
  currentVersion: CmsPageVersion | null
  sectionsWithBlocks: { section: CmsSection; blocks: CmsBlock[] }[]
  blockDefinitions: CmsBlockDefinition[]
  canUpdate: boolean
  canPublish: boolean
  canDelete: boolean
  canWriteSeo: boolean
  newsCategories: NewsCategory[] | null
  currentCategoryId: string | null
  tourCategories: TourCategory[] | null
  currentTourCategoryIds: string[]
  tourDestinations: PickableDestination[] | null
  currentTourDestinationIds: string[]
  tourDepartures: TourDeparture[] | null
  seoMetadata: SeoMetadata | null
  initialOgImage?: OgImageValue
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const defByI = new Map(blockDefinitions.map((d) => [d.id, d]))
  const status = currentVersion?.status

  function run(action: () => Promise<ActionResult>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm(`Xoá hẳn trang /${page.slug}? Hành động này ẩn trang khỏi mọi danh sách (soft-delete).`)) return
    setError(null)
    startTransition(async () => {
      const result = await deletePageAction(page.id)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push('/admin/cms')
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">/{page.slug}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {page.pageType} · {page.locale}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
          {status ? (STATUS_LABEL[status] ?? status) : 'Chưa có phiên bản'}
        </span>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <MVButton size="sm" variant="outline" href={`/admin/cms/${page.id}/preview`}>
          Xem trước
        </MVButton>
        {canUpdate && status === 'DRAFT' && (
          <MVButton size="sm" variant="secondary" loading={isPending} onClick={() => run(() => submitForReviewAction(page.id))}>
            Gửi duyệt
          </MVButton>
        )}
        {canUpdate && status === 'IN_REVIEW' && (
          <MVButton size="sm" variant="secondary" loading={isPending} onClick={() => run(() => approvePageAction(page.id))}>
            Duyệt
          </MVButton>
        )}
        {canPublish && status === 'APPROVED' && (
          <>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:border-primary"
              aria-label="Lên lịch xuất bản (tuỳ chọn)"
            />
            <MVButton
              size="sm"
              loading={isPending}
              onClick={() => run(() => publishPageAction(page.id, scheduledAt ? new Date(scheduledAt).toISOString() : undefined))}
            >
              {scheduledAt ? 'Lên lịch xuất bản' : 'Xuất bản ngay'}
            </MVButton>
          </>
        )}
        {canPublish && status === 'SCHEDULED' && (
          <MVButton size="sm" loading={isPending} onClick={() => run(() => publishPageAction(page.id))}>
            Xuất bản ngay
          </MVButton>
        )}
        {canPublish && status === 'PUBLISHED' && (
          <MVButton size="sm" variant="outline" loading={isPending} onClick={() => run(() => unpublishPageAction(page.id))}>
            Gỡ xuất bản
          </MVButton>
        )}
        {canUpdate && status && status !== 'ARCHIVED' && (
          <MVButton size="sm" variant="outline" loading={isPending} onClick={() => run(() => archivePageAction(page.id))}>
            Lưu trữ
          </MVButton>
        )}
        {canDelete && (
          <MVButton size="sm" variant="danger" loading={isPending} onClick={handleDelete}>
            Xoá trang
          </MVButton>
        )}
      </div>

      {newsCategories && canUpdate && (
        <NewsCategoryPicker
          pageId={page.id}
          websiteId={page.websiteId}
          categories={newsCategories.filter((c) => c.isActive || c.id === currentCategoryId)}
          currentCategoryId={currentCategoryId}
        />
      )}

      {tourCategories && canUpdate && (
        <TourCategoryPicker
          pageId={page.id}
          websiteId={page.websiteId}
          categories={tourCategories.filter((c) => c.isActive || currentTourCategoryIds.includes(c.id))}
          currentCategoryIds={currentTourCategoryIds}
        />
      )}

      {tourDestinations && canUpdate && (
        <TourDestinationPicker
          pageId={page.id}
          websiteId={page.websiteId}
          destinations={tourDestinations}
          currentDestinationIds={currentTourDestinationIds}
        />
      )}

      {tourDepartures && canPublish && (
        <TourDeparturesForm pageId={page.id} websiteId={page.websiteId} departures={tourDepartures} />
      )}

      {canWriteSeo && (
        <div>
          <h2 className="mb-2 font-display text-base font-semibold text-foreground">SEO</h2>
          <SeoMetadataForm
            metadata={seoMetadata}
            identity={{
              websiteId: page.websiteId,
              entityType: 'cms_page',
              entityId: page.id,
              locale: page.locale,
              defaultSlug: page.slug,
              defaultTitle: currentVersion?.title ?? page.slug,
            }}
            initialOgImage={initialOgImage}
          />
        </div>
      )}

      <div className="space-y-4">
        {sectionsWithBlocks.map(({ section, blocks }, i) => (
          <section key={section.id} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">{section.sectionKey}</h2>
              {canUpdate && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || isPending}
                    onClick={() => run(() => moveSectionAction(page.id, section.id, sectionsWithBlocks[i - 1].section.position))}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary/60 disabled:opacity-30"
                    aria-label="Đưa lên"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={i === sectionsWithBlocks.length - 1 || isPending}
                    onClick={() => run(() => moveSectionAction(page.id, section.id, sectionsWithBlocks[i + 1].section.position))}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary/60 disabled:opacity-30"
                    aria-label="Đưa xuống"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div key={block.id} className="rounded-lg bg-secondary/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {defByI.get(block.blockDefinitionId)?.name ?? block.blockDefinitionId}
                  </p>
                  {canUpdate ? (
                    <BlockEditor pageId={page.id} sectionKey={section.sectionKey} block={block} />
                  ) : (
                    <pre className="overflow-x-auto text-xs text-foreground/80">{JSON.stringify(block.config, null, 2)}</pre>
                  )}
                </div>
              ))}
              {blocks.length === 0 && <p className="text-sm text-muted-foreground">Chưa có block nào trong section này.</p>}
            </div>
          </section>
        ))}
        {sectionsWithBlocks.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Trang này chưa có section nào.
          </p>
        )}
      </div>
    </div>
  )
}
