import type { SupabaseClientLike } from '@/shared/supabase/types'
import { AppError } from '@/shared/errors/app-error'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type {
  Announcement,
  CmsBlock,
  CmsBlockDefinition,
  CmsLifecycleStatus,
  CmsPage,
  CmsPageVersion,
  CmsSection,
} from '@/modules/cms/domain/types'
import type {
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
  CmsBlockUpdateInput,
  CmsPageCreateInput,
  CmsPageUpdateInput,
  CmsPageVersionCreateInput,
  CmsSectionUpdateInput,
} from '@/modules/cms/schemas/cms.schema'

export type PublishedPageContent = {
  page: CmsPage
  version: CmsPageVersion
  sections: (CmsSection & { blocks: CmsBlock[] })[]
}

export interface CmsRepository {
  findPageById(id: string): Promise<CmsPage | null>
  findPageBySlug(websiteId: string, locale: string, slug: string): Promise<CmsPage | null>
  listPages(websiteId: string, query: PaginationQuery): Promise<PaginatedResult<CmsPage>>
  createPage(input: CmsPageCreateInput, actorId: string): Promise<CmsPage>
  updatePage(id: string, input: CmsPageUpdateInput, actorId: string): Promise<CmsPage>
  softDeletePage(id: string, actorId: string): Promise<void>

  listVersions(pageId: string): Promise<CmsPageVersion[]>
  findVersionById(id: string): Promise<CmsPageVersion | null>
  findCurrentVersion(pageId: string): Promise<CmsPageVersion | null>
  createVersion(pageId: string, input: CmsPageVersionCreateInput, actorId: string): Promise<CmsPageVersion>
  setVersionStatus(
    id: string,
    status: CmsLifecycleStatus,
    extra: { isCurrent?: boolean; publishedAt?: string | null; scheduledPublishAt?: string | null },
  ): Promise<CmsPageVersion>
  unsetCurrentVersion(pageId: string): Promise<void>

  listBlockDefinitions(): Promise<CmsBlockDefinition[]>
  findBlockDefinitionByKey(key: string): Promise<CmsBlockDefinition | null>

  listSections(pageVersionId: string): Promise<CmsSection[]>
  createSection(pageVersionId: string, sectionKey: string, position: number): Promise<CmsSection>
  updateSection(id: string, input: CmsSectionUpdateInput): Promise<CmsSection>
  deleteSection(id: string): Promise<void>
  findSectionById(id: string): Promise<CmsSection | null>

  listBlocks(sectionId: string): Promise<CmsBlock[]>
  createBlock(sectionId: string, blockDefinitionKey: string, position: number, config: Record<string, unknown>): Promise<CmsBlock>
  updateBlock(id: string, input: CmsBlockUpdateInput): Promise<CmsBlock>
  deleteBlock(id: string): Promise<void>
  findBlockById(id: string): Promise<CmsBlock | null>

  listAnnouncements(websiteId: string): Promise<Announcement[]>
  createAnnouncement(input: AnnouncementCreateInput): Promise<Announcement>
  updateAnnouncement(id: string, input: AnnouncementUpdateInput): Promise<Announcement>
  findAnnouncementById(id: string): Promise<Announcement | null>

  findPublishedPage(websiteId: string, locale: string, slug: string): Promise<PublishedPageContent | null>
}

type PageRow = {
  id: string
  website_id: string
  locale: string
  page_type: string
  slug: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}
const mapPage = (r: PageRow): CmsPage => ({
  id: r.id,
  websiteId: r.website_id,
  locale: r.locale,
  pageType: r.page_type as CmsPage['pageType'],
  slug: r.slug,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
})

type VersionRow = {
  id: string
  page_id: string
  version_number: number
  status: string
  title: string
  seo_metadata_id: string | null
  is_current: boolean
  scheduled_publish_at: string | null
  published_at: string | null
  created_at: string
}
const mapVersion = (r: VersionRow): CmsPageVersion => ({
  id: r.id,
  pageId: r.page_id,
  versionNumber: r.version_number,
  status: r.status as CmsLifecycleStatus,
  title: r.title,
  seoMetadataId: r.seo_metadata_id,
  isCurrent: r.is_current,
  scheduledPublishAt: r.scheduled_publish_at,
  publishedAt: r.published_at,
  createdAt: r.created_at,
})

type SectionRow = { id: string; page_version_id: string; section_key: string; position: number }
const mapSection = (r: SectionRow): CmsSection => ({
  id: r.id,
  pageVersionId: r.page_version_id,
  sectionKey: r.section_key,
  position: r.position,
})

type BlockRow = { id: string; section_id: string; block_definition_id: string; position: number; config: unknown }
const mapBlock = (r: BlockRow): CmsBlock => ({
  id: r.id,
  sectionId: r.section_id,
  blockDefinitionId: r.block_definition_id,
  position: r.position,
  config: (r.config ?? {}) as Record<string, unknown>,
})

type BlockDefinitionRow = { id: string; key: string; name: string; config_schema: unknown; status: string }
const mapBlockDefinition = (r: BlockDefinitionRow): CmsBlockDefinition => ({
  id: r.id,
  key: r.key,
  name: r.name,
  configSchema: (r.config_schema ?? {}) as Record<string, unknown>,
  status: r.status as CmsBlockDefinition['status'],
})

type AnnouncementRow = {
  id: string
  website_id: string
  message: string
  link_href: string | null
  starts_at: string | null
  ends_at: string | null
  status: string
}
const mapAnnouncement = (r: AnnouncementRow): Announcement => ({
  id: r.id,
  websiteId: r.website_id,
  message: r.message,
  linkHref: r.link_href,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  status: r.status as Announcement['status'],
})

export class SupabaseCmsRepository implements CmsRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async findPageById(id: string): Promise<CmsPage | null> {
    const { data, error } = await this.client.from('cms_pages').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return data ? mapPage(data) : null
  }

  async findPageBySlug(websiteId: string, locale: string, slug: string): Promise<CmsPage | null> {
    const { data, error } = await this.client
      .from('cms_pages')
      .select('*')
      .eq('website_id', websiteId)
      .eq('locale', locale)
      .ilike('slug', slug)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return data ? mapPage(data) : null
  }

  async listPages(websiteId: string, query: PaginationQuery): Promise<PaginatedResult<CmsPage>> {
    const from = (query.page - 1) * query.pageSize
    let builder = this.client
      .from('cms_pages')
      .select('*', { count: 'exact' })
      .eq('website_id', websiteId)
      .is('deleted_at', null)
    if (query.search) builder = builder.ilike('slug', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return { items: (data ?? []).map(mapPage), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async createPage(input: CmsPageCreateInput, actorId: string): Promise<CmsPage> {
    const { data, error } = await this.client
      .from('cms_pages')
      .insert({
        website_id: input.websiteId,
        locale: input.locale,
        page_type: input.pageType,
        slug: input.slug,
        created_by: actorId,
        updated_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return mapPage(data)
  }

  async updatePage(id: string, input: CmsPageUpdateInput, actorId: string): Promise<CmsPage> {
    const { data, error } = await this.client
      .from('cms_pages')
      .update({ ...(input.slug !== undefined && { slug: input.slug }), updated_by: actorId })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return mapPage(data)
  }

  async softDeletePage(id: string, actorId: string): Promise<void> {
    const { error } = await this.client
      .from('cms_pages')
      .update({ deleted_at: new Date().toISOString(), updated_by: actorId })
      .eq('id', id)
    if (error) throw mapDatabaseError(error, 'CmsPage')
  }

  async listVersions(pageId: string): Promise<CmsPageVersion[]> {
    const { data, error } = await this.client
      .from('cms_page_versions')
      .select('*')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
    if (error) throw mapDatabaseError(error, 'CmsPageVersion')
    return (data ?? []).map(mapVersion)
  }

  async findVersionById(id: string): Promise<CmsPageVersion | null> {
    const { data, error } = await this.client.from('cms_page_versions').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsPageVersion')
    return data ? mapVersion(data) : null
  }

  async findCurrentVersion(pageId: string): Promise<CmsPageVersion | null> {
    const { data, error } = await this.client
      .from('cms_page_versions')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_current', true)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsPageVersion')
    return data ? mapVersion(data) : null
  }

  async createVersion(pageId: string, input: CmsPageVersionCreateInput, actorId: string): Promise<CmsPageVersion> {
    const { data: existing, error: existingError } = await this.client
      .from('cms_page_versions')
      .select('version_number')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existingError) throw mapDatabaseError(existingError, 'CmsPageVersion')
    const nextVersionNumber = (existing?.version_number ?? 0) + 1

    const { data: versionRow, error: versionError } = await this.client
      .from('cms_page_versions')
      .insert({ page_id: pageId, version_number: nextVersionNumber, title: input.title, status: 'DRAFT', created_by: actorId })
      .select('*')
      .single()
    if (versionError) throw mapDatabaseError(versionError, 'CmsPageVersion')

    for (const sectionInput of input.sections) {
      const { data: sectionRow, error: sectionError } = await this.client
        .from('cms_sections')
        .insert({ page_version_id: versionRow.id, section_key: sectionInput.sectionKey, position: sectionInput.position })
        .select('*')
        .single()
      if (sectionError) throw mapDatabaseError(sectionError, 'CmsSection')

      for (const blockInput of sectionInput.blocks) {
        const definition = await this.findBlockDefinitionByKey(blockInput.blockDefinitionKey)
        if (!definition) throw AppError.validation(`Unknown block definition key "${blockInput.blockDefinitionKey}"`)
        const { error: blockError } = await this.client.from('cms_blocks').insert({
          section_id: sectionRow.id,
          block_definition_id: definition.id,
          position: blockInput.position,
          config: blockInput.config as never,
        })
        if (blockError) throw mapDatabaseError(blockError, 'CmsBlock')
      }
    }

    return mapVersion(versionRow)
  }

  async setVersionStatus(
    id: string,
    status: CmsLifecycleStatus,
    extra: { isCurrent?: boolean; publishedAt?: string | null; scheduledPublishAt?: string | null },
  ): Promise<CmsPageVersion> {
    const { data, error } = await this.client
      .from('cms_page_versions')
      .update({
        status,
        ...(extra.isCurrent !== undefined && { is_current: extra.isCurrent }),
        ...(extra.publishedAt !== undefined && { published_at: extra.publishedAt }),
        ...(extra.scheduledPublishAt !== undefined && { scheduled_publish_at: extra.scheduledPublishAt }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsPageVersion')
    return mapVersion(data)
  }

  async unsetCurrentVersion(pageId: string): Promise<void> {
    const { error } = await this.client.from('cms_page_versions').update({ is_current: false }).eq('page_id', pageId).eq('is_current', true)
    if (error) throw mapDatabaseError(error, 'CmsPageVersion')
  }

  async listBlockDefinitions(): Promise<CmsBlockDefinition[]> {
    const { data, error } = await this.client.from('cms_block_definitions').select('*').order('name')
    if (error) throw mapDatabaseError(error, 'CmsBlockDefinition')
    return (data ?? []).map(mapBlockDefinition)
  }

  async findBlockDefinitionByKey(key: string): Promise<CmsBlockDefinition | null> {
    const { data, error } = await this.client.from('cms_block_definitions').select('*').eq('key', key).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsBlockDefinition')
    return data ? mapBlockDefinition(data) : null
  }

  async findSectionById(id: string): Promise<CmsSection | null> {
    const { data, error } = await this.client.from('cms_sections').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsSection')
    return data ? mapSection(data) : null
  }

  async listSections(pageVersionId: string): Promise<CmsSection[]> {
    const { data, error } = await this.client.from('cms_sections').select('*').eq('page_version_id', pageVersionId).order('position')
    if (error) throw mapDatabaseError(error, 'CmsSection')
    return (data ?? []).map(mapSection)
  }

  async createSection(pageVersionId: string, sectionKey: string, position: number): Promise<CmsSection> {
    const { data, error } = await this.client
      .from('cms_sections')
      .insert({ page_version_id: pageVersionId, section_key: sectionKey, position })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsSection')
    return mapSection(data)
  }

  async updateSection(id: string, input: CmsSectionUpdateInput): Promise<CmsSection> {
    const { data, error } = await this.client
      .from('cms_sections')
      .update({
        ...(input.sectionKey !== undefined && { section_key: input.sectionKey }),
        ...(input.position !== undefined && { position: input.position }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsSection')
    return mapSection(data)
  }

  async deleteSection(id: string): Promise<void> {
    const { error } = await this.client.from('cms_sections').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'CmsSection')
  }

  async findBlockById(id: string): Promise<CmsBlock | null> {
    const { data, error } = await this.client.from('cms_blocks').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsBlock')
    return data ? mapBlock(data) : null
  }

  async listBlocks(sectionId: string): Promise<CmsBlock[]> {
    const { data, error } = await this.client.from('cms_blocks').select('*').eq('section_id', sectionId).order('position')
    if (error) throw mapDatabaseError(error, 'CmsBlock')
    return (data ?? []).map(mapBlock)
  }

  async createBlock(sectionId: string, blockDefinitionKey: string, position: number, config: Record<string, unknown>): Promise<CmsBlock> {
    const definition = await this.findBlockDefinitionByKey(blockDefinitionKey)
    if (!definition) throw AppError.validation(`Unknown block definition key "${blockDefinitionKey}"`)
    const { data, error } = await this.client
      .from('cms_blocks')
      .insert({ section_id: sectionId, block_definition_id: definition.id, position, config: config as never })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsBlock')
    return mapBlock(data)
  }

  async updateBlock(id: string, input: CmsBlockUpdateInput): Promise<CmsBlock> {
    const { data, error } = await this.client
      .from('cms_blocks')
      .update({
        ...(input.position !== undefined && { position: input.position }),
        ...(input.config !== undefined && { config: input.config as never }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CmsBlock')
    return mapBlock(data)
  }

  async deleteBlock(id: string): Promise<void> {
    const { error } = await this.client.from('cms_blocks').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'CmsBlock')
  }

  async listAnnouncements(websiteId: string): Promise<Announcement[]> {
    const { data, error } = await this.client.from('announcements').select('*').eq('website_id', websiteId).order('created_at', { ascending: false })
    if (error) throw mapDatabaseError(error, 'Announcement')
    return (data ?? []).map(mapAnnouncement)
  }

  async createAnnouncement(input: AnnouncementCreateInput): Promise<Announcement> {
    const { data, error } = await this.client
      .from('announcements')
      .insert({
        website_id: input.websiteId,
        message: input.message,
        link_href: input.linkHref ?? null,
        starts_at: input.startsAt ?? null,
        ends_at: input.endsAt ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Announcement')
    return mapAnnouncement(data)
  }

  async updateAnnouncement(id: string, input: AnnouncementUpdateInput): Promise<Announcement> {
    const { data, error } = await this.client
      .from('announcements')
      .update({
        ...(input.message !== undefined && { message: input.message }),
        ...(input.linkHref !== undefined && { link_href: input.linkHref }),
        ...(input.startsAt !== undefined && { starts_at: input.startsAt }),
        ...(input.endsAt !== undefined && { ends_at: input.endsAt }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Announcement')
    return mapAnnouncement(data)
  }

  async findAnnouncementById(id: string): Promise<Announcement | null> {
    const { data, error } = await this.client.from('announcements').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'Announcement')
    return data ? mapAnnouncement(data) : null
  }

  async findPublishedPage(websiteId: string, locale: string, slug: string): Promise<PublishedPageContent | null> {
    const page = await this.findPageBySlug(websiteId, locale, slug)
    if (!page) return null

    const { data: versionRow, error: versionError } = await this.client
      .from('cms_page_versions')
      .select('*')
      .eq('page_id', page.id)
      .eq('is_current', true)
      .eq('status', 'PUBLISHED')
      .maybeSingle()
    if (versionError) throw mapDatabaseError(versionError, 'CmsPageVersion')
    if (!versionRow) return null
    const version = mapVersion(versionRow)

    const { data: sectionRows, error: sectionsError } = await this.client
      .from('cms_sections')
      .select('*')
      .eq('page_version_id', version.id)
      .order('position')
    if (sectionsError) throw mapDatabaseError(sectionsError, 'CmsSection')

    const sections = await Promise.all(
      (sectionRows ?? []).map(async (sectionRow) => {
        const { data: blockRows, error: blocksError } = await this.client
          .from('cms_blocks')
          .select('*')
          .eq('section_id', sectionRow.id)
          .order('position')
        if (blocksError) throw mapDatabaseError(blocksError, 'CmsBlock')
        return { ...mapSection(sectionRow), blocks: (blockRows ?? []).map(mapBlock) }
      }),
    )

    return { page, version, sections }
  }
}
