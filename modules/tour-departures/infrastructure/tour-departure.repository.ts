import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { TourDeparture } from '@/modules/tour-departures/domain/types'
import type { TourDepartureCreateInput, TourDepartureUpdateInput } from '@/modules/tour-departures/schemas/tour-departure.schema'

export interface TourDepartureRepository {
  listByPage(pageId: string): Promise<TourDeparture[]>
  findById(id: string): Promise<TourDeparture | null>
  create(input: TourDepartureCreateInput): Promise<TourDeparture>
  update(id: string, input: TourDepartureUpdateInput): Promise<TourDeparture>
  delete(id: string): Promise<void>
}

type DepartureRow = {
  id: string
  page_id: string
  departure_date: string
  return_date: string | null
  price: number
  currency: string
  price_type: string
  seats_total: number | null
  seats_available: number | null
  status: string
  created_at: string
  updated_at: string
}
const mapDeparture = (r: DepartureRow): TourDeparture => ({
  id: r.id,
  pageId: r.page_id,
  departureDate: r.departure_date,
  returnDate: r.return_date,
  price: r.price,
  currency: r.currency,
  priceType: r.price_type as TourDeparture['priceType'],
  seatsTotal: r.seats_total,
  seatsAvailable: r.seats_available,
  status: r.status as TourDeparture['status'],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export class SupabaseTourDepartureRepository implements TourDepartureRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listByPage(pageId: string): Promise<TourDeparture[]> {
    const { data, error } = await this.client
      .from('tour_departures')
      .select('*')
      .eq('page_id', pageId)
      .order('departure_date')
    if (error) throw mapDatabaseError(error, 'TourDeparture')
    return (data ?? []).map(mapDeparture)
  }

  async findById(id: string): Promise<TourDeparture | null> {
    const { data, error } = await this.client.from('tour_departures').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'TourDeparture')
    return data ? mapDeparture(data) : null
  }

  async create(input: TourDepartureCreateInput): Promise<TourDeparture> {
    const { data, error } = await this.client
      .from('tour_departures')
      .insert({
        page_id: input.pageId,
        departure_date: input.departureDate,
        return_date: input.returnDate ?? null,
        price: input.price,
        price_type: input.priceType,
        seats_total: input.seatsTotal ?? null,
        seats_available: input.seatsAvailable ?? null,
        status: input.status,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'TourDeparture')
    return mapDeparture(data)
  }

  async update(id: string, input: TourDepartureUpdateInput): Promise<TourDeparture> {
    const { data, error } = await this.client
      .from('tour_departures')
      .update({
        ...(input.departureDate !== undefined && { departure_date: input.departureDate }),
        ...(input.returnDate !== undefined && { return_date: input.returnDate }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.priceType !== undefined && { price_type: input.priceType }),
        ...(input.seatsTotal !== undefined && { seats_total: input.seatsTotal }),
        ...(input.seatsAvailable !== undefined && { seats_available: input.seatsAvailable }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'TourDeparture')
    return mapDeparture(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('tour_departures').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'TourDeparture')
  }
}
