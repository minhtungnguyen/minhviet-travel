import { z } from 'zod'
import { uuidSchema } from '@/shared/validation/common'

export const importJobCreateSchema = z
  .object({
    websiteId: uuidSchema,
    entityType: z.literal('tour'), // MVP: Tour is the only AI Import consumer (Sprint 7 Phase 0 decision)
    sourceMediaAssetId: uuidSchema,
  })
  .strict()
export type ImportJobCreateInput = z.infer<typeof importJobCreateSchema>

const tourImportItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
})

/**
 * Shape the Anthropic provider's `normalize()` targets for `entityType:
 * 'tour'` — a subset of Tour Core's real fields (see
 * lib/tours/public-tours.ts's PublicTourDetail). Every field is optional
 * here on purpose: a partially-extracted Word doc still produces a
 * usable draft, with `ImportValidationError`s (computed separately, not
 * by this schema) flagging what a human reviewer must fill in before
 * Approve. Categories/destinations/departures are deliberately NOT part
 * of this shape — those are structured relational data with real admin
 * pickers already; AI Import only targets the free-text overview/
 * itinerary/policy content a Word doc actually contains.
 */
export const tourImportDraftDataSchema = z.object({
  title: z.string().trim().min(1).optional(),
  country: z.string().trim().optional(),
  departureCity: z.string().trim().optional(),
  body: z.string().trim().optional(),
  itinerary: z.array(tourImportItineraryDaySchema).optional(),
  inclusions: z.array(z.string().min(1)).optional(),
  exclusions: z.array(z.string().min(1)).optional(),
  cancellationNote: z.string().optional(),
  suggestedCategoryName: z.string().trim().optional(),
})
export type TourImportDraftData = z.infer<typeof tourImportDraftDataSchema>
