import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'

/**
 * Join-table only — the destinations themselves are the existing,
 * already vertical-agnostic `destinations` table (modules/master-data),
 * reused as-is. This module owns only `tour_page_destinations`.
 */
export interface TourDestinationRepository {
  /** Delete-then-insert, sort_order = array position (itinerary order). */
  replaceTourDestinations(pageId: string, destinationIds: string[]): Promise<void>
  listTourDestinationIds(pageId: string): Promise<string[]>
}

export class SupabaseTourDestinationRepository implements TourDestinationRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async replaceTourDestinations(pageId: string, destinationIds: string[]): Promise<void> {
    const { error: deleteError } = await this.client.from('tour_page_destinations').delete().eq('page_id', pageId)
    if (deleteError) throw mapDatabaseError(deleteError, 'TourPageDestination')
    if (destinationIds.length === 0) return
    const { error: insertError } = await this.client
      .from('tour_page_destinations')
      .insert(destinationIds.map((destinationId, index) => ({ page_id: pageId, destination_id: destinationId, sort_order: index })))
    if (insertError) throw mapDatabaseError(insertError, 'TourPageDestination')
  }

  async listTourDestinationIds(pageId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('tour_page_destinations')
      .select('destination_id')
      .eq('page_id', pageId)
      .order('sort_order')
    if (error) throw mapDatabaseError(error, 'TourPageDestination')
    return (data ?? []).map((r) => r.destination_id)
  }
}
