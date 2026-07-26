import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type {
  City,
  Country,
  Currency,
  CustomerType,
  Destination,
  DestinationTranslation,
  Language,
  ProductType,
  Province,
} from '@/modules/master-data/domain/types'
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

/**
 * Every method here reads/writes a table with zero foreign key into any
 * business-domain table — that's the "globally reusable" property the
 * approved schema already has; this repository just exposes it uniformly.
 * `destinations` is the one resource with real structure (self-referencing
 * hierarchy + per-locale translations); everything else is a flat lookup.
 */
export interface MasterDataRepository {
  listCurrencies(): Promise<Currency[]>
  createCurrency(input: CurrencyCreateInput): Promise<Currency>
  updateCurrency(code: string, input: CurrencyUpdateInput): Promise<Currency>

  listLanguages(): Promise<Language[]>
  createLanguage(input: LanguageCreateInput): Promise<Language>
  updateLanguage(code: string, input: LanguageUpdateInput): Promise<Language>

  listCountries(): Promise<Country[]>
  createCountry(input: CountryCreateInput): Promise<Country>
  updateCountry(code: string, input: CountryUpdateInput): Promise<Country>

  listProvinces(countryCode?: string): Promise<Province[]>
  createProvince(input: ProvinceCreateInput): Promise<Province>
  updateProvince(id: string, input: ProvinceUpdateInput): Promise<Province>

  listCities(provinceId?: string): Promise<City[]>
  createCity(input: CityCreateInput): Promise<City>
  updateCity(id: string, input: CityUpdateInput): Promise<City>

  listDestinations(parentId?: string | null): Promise<Destination[]>
  findDestinationById(id: string): Promise<Destination | null>
  listDestinationTranslations(destinationId: string): Promise<DestinationTranslation[]>
  createDestination(input: DestinationCreateInput): Promise<{ destination: Destination; translations: DestinationTranslation[] }>
  updateDestination(id: string, input: DestinationUpdateInput): Promise<Destination>
  softDeleteDestination(id: string): Promise<void>

  listProductTypes(): Promise<ProductType[]>
  createProductType(input: ProductTypeCreateInput): Promise<ProductType>
  updateProductType(id: string, input: ProductTypeUpdateInput): Promise<ProductType>

  listCustomerTypes(): Promise<CustomerType[]>
  createCustomerType(input: CustomerTypeCreateInput): Promise<CustomerType>
  updateCustomerType(id: string, input: CustomerTypeUpdateInput): Promise<CustomerType>
}

type CurrencyRow = { code: string; name: string; symbol: string; decimal_digits: number; status: string }
const mapCurrency = (r: CurrencyRow): Currency => ({
  code: r.code,
  name: r.name,
  symbol: r.symbol,
  decimalDigits: r.decimal_digits,
  status: r.status as EntityStatusLike,
})

type LanguageRow = { code: string; name: string; native_name: string; status: string }
const mapLanguage = (r: LanguageRow): Language => ({
  code: r.code,
  name: r.name,
  nativeName: r.native_name,
  status: r.status as EntityStatusLike,
})

type CountryRow = {
  code: string
  name: string
  native_name: string | null
  region: string | null
  default_currency_code: string | null
  status: string
}
const mapCountry = (r: CountryRow): Country => ({
  code: r.code,
  name: r.name,
  nativeName: r.native_name,
  region: r.region,
  defaultCurrencyCode: r.default_currency_code,
  status: r.status as EntityStatusLike,
})

type ProvinceRow = { id: string; country_code: string; name: string; code: string; status: string }
const mapProvince = (r: ProvinceRow): Province => ({
  id: r.id,
  countryCode: r.country_code,
  name: r.name,
  code: r.code,
  status: r.status as EntityStatusLike,
})

type CityRow = { id: string; province_id: string; name: string; status: string }
const mapCity = (r: CityRow): City => ({
  id: r.id,
  provinceId: r.province_id,
  name: r.name,
  status: r.status as EntityStatusLike,
})

type DestinationRow = {
  id: string
  parent_destination_id: string | null
  destination_type: string
  country_code: string | null
  latitude: number | null
  longitude: number | null
  is_featured: boolean
  status: string
  deleted_at: string | null
}
const mapDestination = (r: DestinationRow): Destination => ({
  id: r.id,
  parentDestinationId: r.parent_destination_id,
  destinationType: r.destination_type as Destination['destinationType'],
  countryCode: r.country_code,
  latitude: r.latitude,
  longitude: r.longitude,
  isFeatured: r.is_featured,
  status: r.status as EntityStatusLike,
  deletedAt: r.deleted_at,
})

type DestinationTranslationRow = {
  id: string
  destination_id: string
  locale: string
  name: string
  slug: string
  description: string | null
}
const mapDestinationTranslation = (r: DestinationTranslationRow): DestinationTranslation => ({
  id: r.id,
  destinationId: r.destination_id,
  locale: r.locale,
  name: r.name,
  slug: r.slug,
  description: r.description,
})

type ProductTypeRow = { id: string; code: string; name: string; status: string }
const mapProductType = (r: ProductTypeRow): ProductType => ({
  id: r.id,
  code: r.code,
  name: r.name,
  status: r.status as EntityStatusLike,
})

type CustomerTypeRow = { id: string; code: string; name: string; status: string }
const mapCustomerType = (r: CustomerTypeRow): CustomerType => ({
  id: r.id,
  code: r.code,
  name: r.name,
  status: r.status as EntityStatusLike,
})

type EntityStatusLike = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export class SupabaseMasterDataRepository implements MasterDataRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listCurrencies(): Promise<Currency[]> {
    const { data, error } = await this.client.from('currencies').select('*').order('code')
    if (error) throw mapDatabaseError(error, 'Currency')
    return (data ?? []).map(mapCurrency)
  }

  async createCurrency(input: CurrencyCreateInput): Promise<Currency> {
    const { data, error } = await this.client
      .from('currencies')
      .insert({ code: input.code, name: input.name, symbol: input.symbol, decimal_digits: input.decimalDigits })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Currency')
    return mapCurrency(data)
  }

  async updateCurrency(code: string, input: CurrencyUpdateInput): Promise<Currency> {
    const { data, error } = await this.client
      .from('currencies')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.symbol !== undefined && { symbol: input.symbol }),
        ...(input.decimalDigits !== undefined && { decimal_digits: input.decimalDigits }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('code', code)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Currency')
    return mapCurrency(data)
  }

  async listLanguages(): Promise<Language[]> {
    const { data, error } = await this.client.from('languages').select('*').order('code')
    if (error) throw mapDatabaseError(error, 'Language')
    return (data ?? []).map(mapLanguage)
  }

  async createLanguage(input: LanguageCreateInput): Promise<Language> {
    const { data, error } = await this.client
      .from('languages')
      .insert({ code: input.code, name: input.name, native_name: input.nativeName })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Language')
    return mapLanguage(data)
  }

  async updateLanguage(code: string, input: LanguageUpdateInput): Promise<Language> {
    const { data, error } = await this.client
      .from('languages')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nativeName !== undefined && { native_name: input.nativeName }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('code', code)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Language')
    return mapLanguage(data)
  }

  async listCountries(): Promise<Country[]> {
    const { data, error } = await this.client.from('countries').select('*').order('name')
    if (error) throw mapDatabaseError(error, 'Country')
    return (data ?? []).map(mapCountry)
  }

  async createCountry(input: CountryCreateInput): Promise<Country> {
    const { data, error } = await this.client
      .from('countries')
      .insert({
        code: input.code,
        name: input.name,
        native_name: input.nativeName ?? null,
        region: input.region ?? null,
        default_currency_code: input.defaultCurrencyCode ?? null,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Country')
    return mapCountry(data)
  }

  async updateCountry(code: string, input: CountryUpdateInput): Promise<Country> {
    const { data, error } = await this.client
      .from('countries')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nativeName !== undefined && { native_name: input.nativeName }),
        ...(input.region !== undefined && { region: input.region }),
        ...(input.defaultCurrencyCode !== undefined && { default_currency_code: input.defaultCurrencyCode }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('code', code)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Country')
    return mapCountry(data)
  }

  async listProvinces(countryCode?: string): Promise<Province[]> {
    let builder = this.client.from('provinces').select('*')
    if (countryCode) builder = builder.eq('country_code', countryCode)
    const { data, error } = await builder.order('name')
    if (error) throw mapDatabaseError(error, 'Province')
    return (data ?? []).map(mapProvince)
  }

  async createProvince(input: ProvinceCreateInput): Promise<Province> {
    const { data, error } = await this.client
      .from('provinces')
      .insert({ country_code: input.countryCode, name: input.name, code: input.code })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Province')
    return mapProvince(data)
  }

  async updateProvince(id: string, input: ProvinceUpdateInput): Promise<Province> {
    const { data, error } = await this.client
      .from('provinces')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Province')
    return mapProvince(data)
  }

  async listCities(provinceId?: string): Promise<City[]> {
    let builder = this.client.from('cities').select('*')
    if (provinceId) builder = builder.eq('province_id', provinceId)
    const { data, error } = await builder.order('name')
    if (error) throw mapDatabaseError(error, 'City')
    return (data ?? []).map(mapCity)
  }

  async createCity(input: CityCreateInput): Promise<City> {
    const { data, error } = await this.client
      .from('cities')
      .insert({ province_id: input.provinceId, name: input.name })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'City')
    return mapCity(data)
  }

  async updateCity(id: string, input: CityUpdateInput): Promise<City> {
    const { data, error } = await this.client
      .from('cities')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'City')
    return mapCity(data)
  }

  async listDestinations(parentId?: string | null): Promise<Destination[]> {
    let builder = this.client.from('destinations').select('*').is('deleted_at', null)
    builder = parentId === undefined ? builder : parentId === null ? builder.is('parent_destination_id', null) : builder.eq('parent_destination_id', parentId)
    const { data, error } = await builder.order('is_featured', { ascending: false })
    if (error) throw mapDatabaseError(error, 'Destination')
    return (data ?? []).map(mapDestination)
  }

  async findDestinationById(id: string): Promise<Destination | null> {
    const { data, error } = await this.client
      .from('destinations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'Destination')
    return data ? mapDestination(data) : null
  }

  async listDestinationTranslations(destinationId: string): Promise<DestinationTranslation[]> {
    const { data, error } = await this.client
      .from('destination_translations')
      .select('*')
      .eq('destination_id', destinationId)
    if (error) throw mapDatabaseError(error, 'DestinationTranslation')
    return (data ?? []).map(mapDestinationTranslation)
  }

  async createDestination(
    input: DestinationCreateInput,
  ): Promise<{ destination: Destination; translations: DestinationTranslation[] }> {
    const { data: destinationRow, error: destinationError } = await this.client
      .from('destinations')
      .insert({
        parent_destination_id: input.parentDestinationId ?? null,
        destination_type: input.destinationType,
        country_code: input.countryCode ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        is_featured: input.isFeatured,
      })
      .select('*')
      .single()
    if (destinationError) throw mapDatabaseError(destinationError, 'Destination')

    const { data: translationRows, error: translationError } = await this.client
      .from('destination_translations')
      .insert(
        input.translations.map((t) => ({
          destination_id: destinationRow.id,
          locale: t.locale,
          name: t.name,
          slug: t.slug,
          description: t.description ?? null,
        })),
      )
      .select('*')
    if (translationError) throw mapDatabaseError(translationError, 'DestinationTranslation')

    return { destination: mapDestination(destinationRow), translations: (translationRows ?? []).map(mapDestinationTranslation) }
  }

  async updateDestination(id: string, input: DestinationUpdateInput): Promise<Destination> {
    const { data, error } = await this.client
      .from('destinations')
      .update({
        ...(input.parentDestinationId !== undefined && { parent_destination_id: input.parentDestinationId }),
        ...(input.countryCode !== undefined && { country_code: input.countryCode }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.isFeatured !== undefined && { is_featured: input.isFeatured }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'Destination')
    return mapDestination(data)
  }

  async softDeleteDestination(id: string): Promise<void> {
    const { error } = await this.client.from('destinations').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw mapDatabaseError(error, 'Destination')
  }

  async listProductTypes(): Promise<ProductType[]> {
    const { data, error } = await this.client.from('product_types').select('*').order('name')
    if (error) throw mapDatabaseError(error, 'ProductType')
    return (data ?? []).map(mapProductType)
  }

  async createProductType(input: ProductTypeCreateInput): Promise<ProductType> {
    const { data, error } = await this.client
      .from('product_types')
      .insert({ code: input.code, name: input.name })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ProductType')
    return mapProductType(data)
  }

  async updateProductType(id: string, input: ProductTypeUpdateInput): Promise<ProductType> {
    const { data, error } = await this.client
      .from('product_types')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'ProductType')
    return mapProductType(data)
  }

  async listCustomerTypes(): Promise<CustomerType[]> {
    const { data, error } = await this.client.from('customer_types').select('*').order('name')
    if (error) throw mapDatabaseError(error, 'CustomerType')
    return (data ?? []).map(mapCustomerType)
  }

  async createCustomerType(input: CustomerTypeCreateInput): Promise<CustomerType> {
    const { data, error } = await this.client
      .from('customer_types')
      .insert({ code: input.code, name: input.name })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CustomerType')
    return mapCustomerType(data)
  }

  async updateCustomerType(id: string, input: CustomerTypeUpdateInput): Promise<CustomerType> {
    const { data, error } = await this.client
      .from('customer_types')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'CustomerType')
    return mapCustomerType(data)
  }
}
