import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { AttractionTicketRepository } from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import type { AttractionTicketProvider } from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'

/**
 * Manual sync only — no cron/scheduled job (docs/mv-ticket/02-system-
 * architecture.md §6: "không cron tự động" for V1). An admin creates a
 * venue/product in the CMS first (attraction-catalog.service.ts), then
 * triggers a sync here to link it to a provider id and pull the current
 * variant mapping — this does NOT auto-import a provider's full catalog
 * (brief §VII: "không import toàn bộ dữ liệu động định kỳ nếu chưa cần").
 *
 * `syncProducts()`'s `ProviderIdMapping.internalProductId` values that
 * don't match any local `attraction_products` row are skipped, not
 * treated as an error — the provider may know about products Minh Việt
 * hasn't chosen to sell yet. Every run writes exactly one
 * `attraction_sync_logs` row summarizing the batch.
 */
export class AttractionSyncService {
  constructor(
    private readonly repository: AttractionTicketRepository,
    private readonly auditLogger: AuditLogger,
    private readonly provider: AttractionTicketProvider,
  ) {}

  async syncProducts(actor: ActorContext, requestId: string) {
    requirePermission(actor, 'attraction_ticket.sync.trigger')
    try {
      const mappings = await this.provider.syncProducts()
      let matched = 0
      for (const mapping of mappings) {
        const product = await this.repository.findProductById(mapping.internalProductId)
        if (!product) continue
        await this.repository.upsertProviderRefForProduct(product.id, {
          providerCode: 'ONEINVENTORY',
          providerProductId: mapping.providerProductId,
          providerVariantId: mapping.providerVariantId ?? null,
        })
        matched += 1
      }
      const log = await this.repository.createSyncLog({
        syncType: 'PRODUCT',
        status: 'SUCCESS',
        triggeredBy: actor.userId,
      })
      await this.auditLogger({
        actorUserId: actor.userId,
        organizationId: actor.organizationId,
        action: 'attraction_ticket.sync.products',
        entityType: 'attraction_sync_log',
        entityId: log.id,
        requestId,
        reason: `${matched}/${mappings.length} provider products matched a local product`,
      })
      return { matched, total: mappings.length, syncLog: log }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await this.repository.createSyncLog({
        syncType: 'PRODUCT',
        status: 'FAILED',
        errorMessage: message,
        triggeredBy: actor.userId,
      })
      throw error
    }
  }

  async syncVariantsForProduct(actor: ActorContext, productId: string, requestId: string) {
    requirePermission(actor, 'attraction_ticket.sync.trigger')
    const product = await this.repository.findProductById(productId)
    if (!product) throw AppError.notFound('AttractionProduct', productId)

    const ref = await this.repository.findProviderRefByProduct(productId)
    if (!ref?.providerProductId) {
      throw AppError.conflict('Sync this product with the provider (syncProducts) before syncing its variants')
    }

    try {
      const mappings = await this.provider.syncVariants(ref.providerProductId)
      // V1 models one provider variant per `attraction_products` row (no
      // separate TicketVariant table — see docs/mv-ticket/03-database-
      // design.md). Multiple returned variants means the provider offers
      // more ticket types than this product currently represents; only
      // the first is applied, the rest are informational for now.
      const primary = mappings[0]
      const updatedRef = primary
        ? await this.repository.upsertProviderRefForProduct(productId, {
            providerCode: 'ONEINVENTORY',
            providerProductId: ref.providerProductId,
            providerVariantId: primary.providerVariantId ?? null,
          })
        : ref

      const log = await this.repository.createSyncLog({
        syncType: 'VENUE',
        status: 'SUCCESS',
        attractionProductId: productId,
        triggeredBy: actor.userId,
      })
      await this.auditLogger({
        actorUserId: actor.userId,
        organizationId: actor.organizationId,
        websiteId: product.websiteId,
        action: 'attraction_ticket.sync.variants',
        entityType: 'attraction_product',
        entityId: productId,
        requestId,
        reason: `${mappings.length} variant(s) returned`,
      })
      return { providerRef: updatedRef, variantCount: mappings.length, syncLog: log }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await this.repository.createSyncLog({
        syncType: 'VENUE',
        status: 'FAILED',
        attractionProductId: productId,
        errorMessage: message,
        triggeredBy: actor.userId,
      })
      throw error
    }
  }
}

// NOTE: a `listSyncLogs`/`listApiErrorLogs` read method for Phase 5's CMS
// "Sync logs" / "API error logs" screens is deliberately not added yet —
// the repository has no corresponding list method (only `createSyncLog`/
// `createApiErrorLog`), and a stub returning `[]` would be dead code, not
// a real feature. Add both together (repository list method + this
// service method + pagination) when Phase 5 actually builds the screen
// that consumes them.
