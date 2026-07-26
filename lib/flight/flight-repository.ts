import 'server-only'
import { cache } from 'react'
import { flightHomeContentSeed } from '@/lib/flight/flight-data-seed'
import { flightHomeContentSchema } from '@/lib/flight/flight-schema'
import type { FlightHomeContent } from '@/types/flight'

/**
 * The single seam a real CMS/flight-fare integration needs to replace —
 * mirrors `lib/cms/client.ts` / `lib/mice/mice-repository.ts`. Every
 * /ve-may-bay section component calls this and depends only on
 * `FlightHomeContent`, never the raw seed file.
 */
export const getFlightHomeContent = cache(async (): Promise<FlightHomeContent> => {
  const raw: unknown = flightHomeContentSeed
  return flightHomeContentSchema.parse(raw)
})
