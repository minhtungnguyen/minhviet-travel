import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'
import { TourCategoryService } from '@/modules/tour-categories/application/tour-category.service'
import { SupabaseTourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import { TourDestinationService } from '@/modules/tour-destinations/application/tour-destination.service'
import { SupabaseTourDestinationRepository } from '@/modules/tour-destinations/infrastructure/tour-destination.repository'
import { TourDepartureService } from '@/modules/tour-departures/application/tour-departure.service'
import { SupabaseTourDepartureRepository } from '@/modules/tour-departures/infrastructure/tour-departure.repository'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'
import { resolveMediaImageUrl } from '@/lib/seo/resolve-media-image'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { CmsPageEditor } from '@/components/admin/cms-page-editor'
import type { OgImageValue } from '@/components/admin/seo-og-image-picker'

export const metadata: Metadata = { title: 'Chỉnh sửa trang | Minh Việt Travel Admin' }

export default async function AdminCmsPageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)

  const [page, versions, sections, blockDefinitions] = await Promise.all([
    service.getPage(id),
    service.listVersions(actor, id),
    service.listSections(actor, id),
    service.listBlockDefinitions(),
  ])
  const currentVersion = versions[0] ?? null

  const sectionsWithBlocks = await Promise.all(
    sections
      .sort((a, b) => a.position - b.position)
      .map(async (section) => ({
        section,
        blocks: (await service.listBlocks(actor, section.id)).sort((a, b) => a.position - b.position),
      })),
  )

  const canWriteSeo = hasPermission(actor, 'seo.metadata.update')
  const seoService = new SeoService(new SupabaseSeoRepository(supabase), supabase, recordAuditLog)
  const seoMetadata = canWriteSeo
    ? await seoService.getMetadata(page.websiteId, 'cms_page', page.id, page.locale).catch(() => null)
    : null
  const initialOgImageSrc = seoMetadata?.ogImageMediaId ? await resolveMediaImageUrl(supabase, seoMetadata.ogImageMediaId) : null
  const initialOgImage: OgImageValue =
    seoMetadata?.ogImageMediaId && initialOgImageSrc ? { mediaId: seoMetadata.ogImageMediaId, src: initialOgImageSrc } : null

  const isNewsArticle = page.slug.startsWith(NEWS_SLUG_PREFIX)
  const categoryService = new NewsCategoryService(new SupabaseNewsCategoryRepository(supabase), supabase, recordAuditLog)
  const [categories, currentCategoryId] = isNewsArticle
    ? await Promise.all([categoryService.listCategories(page.websiteId), categoryService.getArticleCategoryId(page.id)])
    : [[], null]

  const isTour = page.slug.startsWith(TOUR_SLUG_PREFIX)
  const tourCategoryService = new TourCategoryService(new SupabaseTourCategoryRepository(supabase), supabase, recordAuditLog)
  const tourDestinationService = new TourDestinationService(new SupabaseTourDestinationRepository(supabase), supabase, recordAuditLog)
  const tourDepartureService = new TourDepartureService(new SupabaseTourDepartureRepository(supabase), supabase, recordAuditLog)
  const masterDataService = new MasterDataService(new SupabaseMasterDataRepository(supabase), recordAuditLog)
  const [tourCategories, currentTourCategoryIds, allDestinations, currentTourDestinationIds, tourDepartures] = isTour
    ? await Promise.all([
        tourCategoryService.listCategories(page.websiteId),
        tourCategoryService.getTourCategoryIds(page.id),
        masterDataService.listDestinations(page.locale),
        tourDestinationService.getTourDestinationIds(page.id),
        tourDepartureService.listByPage(page.id),
      ])
    : [[], [], [], [], []]
  const pickableDestinations = allDestinations.map((d) => ({ id: d.id, name: d.translation?.name ?? d.id }))

  return (
    <CmsPageEditor
      page={page}
      currentVersion={currentVersion}
      sectionsWithBlocks={sectionsWithBlocks}
      blockDefinitions={blockDefinitions}
      canUpdate={hasPermission(actor, 'cms.page.update')}
      canPublish={hasPermission(actor, 'cms.page.publish')}
      canDelete={hasPermission(actor, 'cms.page.delete')}
      canWriteSeo={canWriteSeo}
      seoMetadata={seoMetadata}
      initialOgImage={initialOgImage}
      newsCategories={isNewsArticle ? categories : null}
      currentCategoryId={currentCategoryId}
      tourCategories={isTour ? tourCategories : null}
      currentTourCategoryIds={currentTourCategoryIds}
      tourDestinations={isTour ? pickableDestinations : null}
      currentTourDestinationIds={currentTourDestinationIds}
      tourDepartures={isTour ? tourDepartures : null}
    />
  )
}
