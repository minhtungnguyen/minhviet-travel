import { z } from 'zod'
import { uuidSchema } from '@/shared/validation/common'

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
const statusSchema = z.enum(['OPEN', 'LIMITED', 'ALMOST_FULL', 'CLOSED', 'PENDING_CONFIRMATION'])
const priceTypeSchema = z.enum(['ESTIMATE', 'CONFIRMED'])

export const tourDepartureCreateSchema = z.object({
  pageId: uuidSchema,
  departureDate: dateOnlySchema,
  returnDate: dateOnlySchema.optional(),
  price: z.number().int().min(0),
  priceType: priceTypeSchema.default('ESTIMATE'),
  seatsTotal: z.number().int().min(0).optional(),
  seatsAvailable: z.number().int().min(0).optional(),
  status: statusSchema.default('OPEN'),
}).strict()

export const tourDepartureUpdateSchema = z.object({
  departureDate: dateOnlySchema.optional(),
  returnDate: dateOnlySchema.nullable().optional(),
  price: z.number().int().min(0).optional(),
  priceType: priceTypeSchema.optional(),
  seatsTotal: z.number().int().min(0).nullable().optional(),
  seatsAvailable: z.number().int().min(0).nullable().optional(),
  status: statusSchema.optional(),
}).strict()

export type TourDepartureCreateInput = z.infer<typeof tourDepartureCreateSchema>
export type TourDepartureUpdateInput = z.infer<typeof tourDepartureUpdateSchema>
