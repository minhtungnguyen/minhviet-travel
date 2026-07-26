import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { MasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'
import type {
  CityCreateInput,
  CityUpdateInput,
  CountryCreateInput,
  CountryUpdateInput,
  CurrencyCreateInput,
  CurrencyUpdateInput,
  CustomerTypeCreateInput,
  CustomerTypeUpdateInput,
  DestinationCreateInput,
  DestinationUpdateInput,
  LanguageCreateInput,
  LanguageUpdateInput,
  ProductTypeCreateInput,
  ProductTypeUpdateInput,
  ProvinceCreateInput,
  ProvinceUpdateInput,
} from '@/modules/master-data/schemas/master-data.schema'

const MASTER_DATA_PERMISSION = 'master_data.manage'
const DESTINATION_PERMISSION = 'master_data.destination.update'

/**
 * Reads are open to any authenticated caller (no `requirePermission`) —
 * matches the RLS design: these tables are anon+authenticated readable
 * by design (docs/database/rls-policy-matrix.md: "harmless reference
 * data, world-readable"). Writes require `master_data.manage`
 * (`master_data.destination.update` for destinations specifically).
 */
export class MasterDataService {
  constructor(
    private readonly repository: MasterDataRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  listCurrencies() {
    return this.repository.listCurrencies()
  }

  async createCurrency(actor: ActorContext, input: CurrencyCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const currency = await this.repository.createCurrency(input)
    await this.audit(actor, 'currency.created', 'currency', currency.code, requestId)
    return currency
  }

  async updateCurrency(actor: ActorContext, code: string, input: CurrencyUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const currency = await this.repository.updateCurrency(code, input)
    await this.audit(actor, 'currency.updated', 'currency', code, requestId)
    return currency
  }

  listLanguages() {
    return this.repository.listLanguages()
  }

  async createLanguage(actor: ActorContext, input: LanguageCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const language = await this.repository.createLanguage(input)
    await this.audit(actor, 'language.created', 'language', language.code, requestId)
    return language
  }

  async updateLanguage(actor: ActorContext, code: string, input: LanguageUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const language = await this.repository.updateLanguage(code, input)
    await this.audit(actor, 'language.updated', 'language', code, requestId)
    return language
  }

  listCountries() {
    return this.repository.listCountries()
  }

  async createCountry(actor: ActorContext, input: CountryCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const country = await this.repository.createCountry(input)
    await this.audit(actor, 'country.created', 'country', country.code, requestId)
    return country
  }

  async updateCountry(actor: ActorContext, code: string, input: CountryUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const country = await this.repository.updateCountry(code, input)
    await this.audit(actor, 'country.updated', 'country', code, requestId)
    return country
  }

  listProvinces(countryCode?: string) {
    return this.repository.listProvinces(countryCode)
  }

  async createProvince(actor: ActorContext, input: ProvinceCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const province = await this.repository.createProvince(input)
    await this.audit(actor, 'province.created', 'province', province.id, requestId)
    return province
  }

  async updateProvince(actor: ActorContext, id: string, input: ProvinceUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const province = await this.repository.updateProvince(id, input)
    await this.audit(actor, 'province.updated', 'province', id, requestId)
    return province
  }

  listCities(provinceId?: string) {
    return this.repository.listCities(provinceId)
  }

  async createCity(actor: ActorContext, input: CityCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const city = await this.repository.createCity(input)
    await this.audit(actor, 'city.created', 'city', city.id, requestId)
    return city
  }

  async updateCity(actor: ActorContext, id: string, input: CityUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const city = await this.repository.updateCity(id, input)
    await this.audit(actor, 'city.updated', 'city', id, requestId)
    return city
  }

  async listDestinations(locale: string, parentId?: string | null) {
    const destinations = await this.repository.listDestinations(parentId)
    return Promise.all(
      destinations.map(async (destination) => {
        const translations = await this.repository.listDestinationTranslations(destination.id)
        const translation = translations.find((t) => t.locale === locale) ?? translations[0] ?? null
        return { ...destination, translation }
      }),
    )
  }

  async getDestination(id: string) {
    const destination = await this.repository.findDestinationById(id)
    if (!destination) throw AppError.notFound('Destination', id)
    const translations = await this.repository.listDestinationTranslations(id)
    return { destination, translations }
  }

  async createDestination(actor: ActorContext, input: DestinationCreateInput, requestId: string) {
    requirePermission(actor, DESTINATION_PERMISSION)
    const result = await this.repository.createDestination(input)
    await this.audit(actor, 'destination.created', 'destination', result.destination.id, requestId)
    return result
  }

  async updateDestination(actor: ActorContext, id: string, input: DestinationUpdateInput, requestId: string) {
    requirePermission(actor, DESTINATION_PERMISSION)
    const existing = await this.repository.findDestinationById(id)
    if (!existing) throw AppError.notFound('Destination', id)
    const destination = await this.repository.updateDestination(id, input)
    await this.audit(actor, 'destination.updated', 'destination', id, requestId)
    return destination
  }

  async deleteDestination(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, DESTINATION_PERMISSION)
    const existing = await this.repository.findDestinationById(id)
    if (!existing) throw AppError.notFound('Destination', id)
    await this.repository.softDeleteDestination(id)
    await this.audit(actor, 'destination.deleted', 'destination', id, requestId)
  }

  listProductTypes() {
    return this.repository.listProductTypes()
  }

  async createProductType(actor: ActorContext, input: ProductTypeCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const productType = await this.repository.createProductType(input)
    await this.audit(actor, 'product_type.created', 'product_type', productType.id, requestId)
    return productType
  }

  async updateProductType(actor: ActorContext, id: string, input: ProductTypeUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const productType = await this.repository.updateProductType(id, input)
    await this.audit(actor, 'product_type.updated', 'product_type', id, requestId)
    return productType
  }

  listCustomerTypes() {
    return this.repository.listCustomerTypes()
  }

  async createCustomerType(actor: ActorContext, input: CustomerTypeCreateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const customerType = await this.repository.createCustomerType(input)
    await this.audit(actor, 'customer_type.created', 'customer_type', customerType.id, requestId)
    return customerType
  }

  async updateCustomerType(actor: ActorContext, id: string, input: CustomerTypeUpdateInput, requestId: string) {
    requirePermission(actor, MASTER_DATA_PERMISSION)
    const customerType = await this.repository.updateCustomerType(id, input)
    await this.audit(actor, 'customer_type.updated', 'customer_type', id, requestId)
    return customerType
  }

  private async audit(actor: ActorContext, action: string, entityType: string, entityId: string, requestId: string) {
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action,
      entityType,
      entityId,
      requestId,
    })
  }
}
