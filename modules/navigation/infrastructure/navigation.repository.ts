import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { NavigationItem, NavigationMenu } from '@/modules/navigation/domain/types'
import type {
  NavigationItemCreateInput,
  NavigationItemUpdateInput,
  NavigationMenuCreateInput,
  NavigationMenuUpdateInput,
} from '@/modules/navigation/schemas/navigation.schema'

export interface NavigationRepository {
  listMenus(websiteId: string): Promise<NavigationMenu[]>
  findMenuById(id: string): Promise<NavigationMenu | null>
  createMenu(input: NavigationMenuCreateInput): Promise<NavigationMenu>
  updateMenu(id: string, input: NavigationMenuUpdateInput): Promise<NavigationMenu>
  deleteMenu(id: string): Promise<void>

  listItems(menuId: string): Promise<NavigationItem[]>
  findItemById(id: string): Promise<NavigationItem | null>
  createItem(menuId: string, input: NavigationItemCreateInput): Promise<NavigationItem>
  updateItem(id: string, input: NavigationItemUpdateInput): Promise<NavigationItem>
  deleteItem(id: string): Promise<void>

  /** For the cross-website-leak guard: the website a cms_pages row actually belongs to. */
  findCmsPageWebsiteId(cmsPageId: string): Promise<string | null>
}

type MenuRow = { id: string; website_id: string; key: string; locale: string; status: string }
const mapMenu = (r: MenuRow): NavigationMenu => ({
  id: r.id,
  websiteId: r.website_id,
  key: r.key as NavigationMenu['key'],
  locale: r.locale,
  status: r.status as NavigationMenu['status'],
})

type ItemRow = {
  id: string
  menu_id: string
  parent_item_id: string | null
  label: string
  url: string | null
  cms_page_id: string | null
  is_external: boolean
  open_in_new_tab: boolean
  position: number
  status: string
}
const mapItem = (r: ItemRow): NavigationItem => ({
  id: r.id,
  menuId: r.menu_id,
  parentItemId: r.parent_item_id,
  label: r.label,
  url: r.url,
  cmsPageId: r.cms_page_id,
  isExternal: r.is_external,
  openInNewTab: r.open_in_new_tab,
  position: r.position,
  status: r.status as NavigationItem['status'],
})

export class SupabaseNavigationRepository implements NavigationRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listMenus(websiteId: string): Promise<NavigationMenu[]> {
    const { data, error } = await this.client.from('navigation_menus').select('*').eq('website_id', websiteId)
    if (error) throw mapDatabaseError(error, 'NavigationMenu')
    return (data ?? []).map(mapMenu)
  }

  async findMenuById(id: string): Promise<NavigationMenu | null> {
    const { data, error } = await this.client.from('navigation_menus').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'NavigationMenu')
    return data ? mapMenu(data) : null
  }

  async createMenu(input: NavigationMenuCreateInput): Promise<NavigationMenu> {
    const { data, error } = await this.client
      .from('navigation_menus')
      .insert({ website_id: input.websiteId, key: input.key, locale: input.locale })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'NavigationMenu')
    return mapMenu(data)
  }

  async updateMenu(id: string, input: NavigationMenuUpdateInput): Promise<NavigationMenu> {
    const { data, error } = await this.client
      .from('navigation_menus')
      .update({ ...(input.status !== undefined && { status: input.status }) })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'NavigationMenu')
    return mapMenu(data)
  }

  async deleteMenu(id: string): Promise<void> {
    const { error } = await this.client.from('navigation_menus').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'NavigationMenu')
  }

  async listItems(menuId: string): Promise<NavigationItem[]> {
    const { data, error } = await this.client.from('navigation_items').select('*').eq('menu_id', menuId).order('position')
    if (error) throw mapDatabaseError(error, 'NavigationItem')
    return (data ?? []).map(mapItem)
  }

  async findItemById(id: string): Promise<NavigationItem | null> {
    const { data, error } = await this.client.from('navigation_items').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'NavigationItem')
    return data ? mapItem(data) : null
  }

  async createItem(menuId: string, input: NavigationItemCreateInput): Promise<NavigationItem> {
    const { data, error } = await this.client
      .from('navigation_items')
      .insert({
        menu_id: menuId,
        parent_item_id: input.parentItemId ?? null,
        label: input.label,
        url: input.url ?? null,
        cms_page_id: input.cmsPageId ?? null,
        is_external: input.isExternal,
        open_in_new_tab: input.openInNewTab,
        position: input.position,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'NavigationItem')
    return mapItem(data)
  }

  async updateItem(id: string, input: NavigationItemUpdateInput): Promise<NavigationItem> {
    const { data, error } = await this.client
      .from('navigation_items')
      .update({
        ...(input.parentItemId !== undefined && { parent_item_id: input.parentItemId }),
        ...(input.label !== undefined && { label: input.label }),
        ...(input.url !== undefined && { url: input.url }),
        ...(input.cmsPageId !== undefined && { cms_page_id: input.cmsPageId }),
        ...(input.isExternal !== undefined && { is_external: input.isExternal }),
        ...(input.openInNewTab !== undefined && { open_in_new_tab: input.openInNewTab }),
        ...(input.position !== undefined && { position: input.position }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'NavigationItem')
    return mapItem(data)
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await this.client.from('navigation_items').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'NavigationItem')
  }

  async findCmsPageWebsiteId(cmsPageId: string): Promise<string | null> {
    const { data, error } = await this.client.from('cms_pages').select('website_id').eq('id', cmsPageId).maybeSingle()
    if (error) throw mapDatabaseError(error, 'CmsPage')
    return data?.website_id ?? null
  }
}
