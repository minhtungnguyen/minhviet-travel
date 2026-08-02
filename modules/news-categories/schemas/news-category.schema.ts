import { z } from 'zod'
import { slugSchema, uuidSchema } from '@/shared/validation/common'

export const newsCategoryCreateSchema = z.object({
  websiteId: uuidSchema,
  name: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(1000).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().min(0).default(0),
}).strict()

export const newsCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).strict()

export type NewsCategoryCreateInput = z.infer<typeof newsCategoryCreateSchema>
export type NewsCategoryUpdateInput = z.infer<typeof newsCategoryUpdateSchema>
