import { AppError } from '@/shared/errors/app-error'
import { requirePermission, requireWebsiteAccess, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { resolveWebsiteOrganizationId } from '@/shared/organization/resolve-website-organization'
import type { NavigationRepository } from '@/modules/navigation/infrastructure/navigation.repository'
import type {
  NavigationItemCreateInput,
  NavigationItemUpdateInput,
  NavigationMenuCreateInput,
  NavigationMenuUpdateInput,
} from '@/modules/navigation/schemas/navigation.schema'

const MAX_ANCESTRY_WALK = 50 // generous depth guard against a corrupted/very-deep tree, not a real UX limit

export class NavigationService {
  constructor(
    private readonly repository: NavigationRepository,
    private readonly client: SupabaseClientLike,
    private readonly auditLogger: AuditLogger,
  ) {}

  private async checkWebsiteAccess(actor: ActorContext, websiteId: string) {
    const organizationId = await resolveWebsiteOrganizationId(this.client, websiteId)
    requireWebsiteAccess(actor, { id: websiteId, organizationId })
  }

  async listMenus(websiteId: string) {
    return this.repository.listMenus(websiteId)
  }

  async getMenu(id: string) {
    const menu = await this.repository.findMenuById(id)
    if (!menu) throw AppError.notFound('NavigationMenu', id)
    return menu
  }

  async createMenu(actor: ActorContext, input: NavigationMenuCreateInput, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    await this.checkWebsiteAccess(actor, input.websiteId)
    const menu = await this.repository.createMenu(input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: input.websiteId,
      action: 'navigation.menu.created',
      entityType: 'navigation_menu',
      entityId: menu.id,
      requestId,
    })
    return menu
  }

  async updateMenu(actor: ActorContext, id: string, input: NavigationMenuUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    const existing = await this.repository.findMenuById(id)
    if (!existing) throw AppError.notFound('NavigationMenu', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    const menu = await this.repository.updateMenu(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'navigation.menu.updated',
      entityType: 'navigation_menu',
      entityId: id,
      requestId,
    })
    return menu
  }

  async deleteMenu(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    const existing = await this.repository.findMenuById(id)
    if (!existing) throw AppError.notFound('NavigationMenu', id)
    await this.checkWebsiteAccess(actor, existing.websiteId)
    await this.repository.deleteMenu(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: existing.websiteId,
      action: 'navigation.menu.deleted',
      entityType: 'navigation_menu',
      entityId: id,
      requestId,
    })
  }

  async listItems(menuId: string) {
    return this.repository.listItems(menuId)
  }

  private async assertNoCrossWebsiteLeak(cmsPageId: string | undefined, menuWebsiteId: string) {
    if (!cmsPageId) return
    const pageWebsiteId = await this.repository.findCmsPageWebsiteId(cmsPageId)
    if (!pageWebsiteId) throw AppError.validation('cmsPageId does not reference an existing page')
    if (pageWebsiteId !== menuWebsiteId) {
      throw AppError.validation('cmsPageId belongs to a different website than this navigation menu')
    }
  }

  /** Walks up from `proposedParentId` — if `itemId` appears in that chain, assigning it would create a cycle. */
  private async assertNoCycle(itemId: string, proposedParentId: string) {
    if (proposedParentId === itemId) throw AppError.validation('An item cannot be its own parent')
    let currentId: string | null = proposedParentId
    for (let depth = 0; depth < MAX_ANCESTRY_WALK && currentId; depth++) {
      const current = await this.repository.findItemById(currentId)
      if (!current) break
      if (current.parentItemId === itemId) {
        throw AppError.validation('This would create a circular navigation reference')
      }
      currentId = current.parentItemId
    }
  }

  async createItem(actor: ActorContext, menuId: string, input: NavigationItemCreateInput, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    const menu = await this.repository.findMenuById(menuId)
    if (!menu) throw AppError.notFound('NavigationMenu', menuId)
    await this.checkWebsiteAccess(actor, menu.websiteId)
    await this.assertNoCrossWebsiteLeak(input.cmsPageId, menu.websiteId)
    if (input.parentItemId) {
      const parent = await this.repository.findItemById(input.parentItemId)
      if (!parent || parent.menuId !== menuId) throw AppError.validation('parentItemId must belong to the same menu')
    }
    const item = await this.repository.createItem(menuId, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: menu.websiteId,
      action: 'navigation.item.created',
      entityType: 'navigation_item',
      entityId: item.id,
      requestId,
    })
    return item
  }

  async updateItem(actor: ActorContext, id: string, input: NavigationItemUpdateInput, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    const existing = await this.repository.findItemById(id)
    if (!existing) throw AppError.notFound('NavigationItem', id)
    const menu = await this.repository.findMenuById(existing.menuId)
    if (!menu) throw AppError.notFound('NavigationMenu', existing.menuId)
    await this.checkWebsiteAccess(actor, menu.websiteId)
    if (input.cmsPageId) await this.assertNoCrossWebsiteLeak(input.cmsPageId, menu.websiteId)
    if (input.parentItemId) await this.assertNoCycle(id, input.parentItemId)
    const item = await this.repository.updateItem(id, input)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: menu.websiteId,
      action: 'navigation.item.updated',
      entityType: 'navigation_item',
      entityId: id,
      requestId,
    })
    return item
  }

  async deleteItem(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'cms.navigation.update')
    const existing = await this.repository.findItemById(id)
    if (!existing) throw AppError.notFound('NavigationItem', id)
    const menu = await this.repository.findMenuById(existing.menuId)
    if (menu) await this.checkWebsiteAccess(actor, menu.websiteId)
    await this.repository.deleteItem(id)
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      websiteId: menu?.websiteId,
      action: 'navigation.item.deleted',
      entityType: 'navigation_item',
      entityId: id,
      requestId,
    })
  }

  /** Public — active menu + active items only, per docs/database/rls-policy-matrix.md. */
  async getPublicMenu(websiteId: string, menuKey: string, locale: string) {
    const menus = await this.repository.listMenus(websiteId)
    const menu = menus.find((m) => m.key === menuKey && m.locale === locale && m.status === 'ACTIVE')
    if (!menu) throw AppError.notFound('NavigationMenu', menuKey)
    const items = await this.repository.listItems(menu.id)
    return { menu, items: items.filter((item) => item.status === 'ACTIVE') }
  }
}
