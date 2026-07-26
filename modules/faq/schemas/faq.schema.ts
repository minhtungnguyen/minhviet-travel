import { z } from 'zod'
import { generalStatusSchema, localeSchema, slugSchema, uuidSchema } from '@/shared/validation/common'

export const faqCategoryCreateSchema = z.object({
  websiteId: uuidSchema,
  name: z.string().min(1).max(200),
  slug: slugSchema,
  position: z.number().int().min(0).default(0),
}).strict()

export const faqCategoryUpdateSchema = faqCategoryCreateSchema.omit({ websiteId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const faqCreateSchema = z.object({
  faqCategoryId: uuidSchema,
  websiteId: uuidSchema,
  locale: localeSchema,
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  position: z.number().int().min(0).default(0),
}).strict()

export const faqUpdateSchema = faqCreateSchema.omit({ faqCategoryId: true, websiteId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export type FaqCategoryCreateInput = z.infer<typeof faqCategoryCreateSchema>
export type FaqCategoryUpdateInput = z.infer<typeof faqCategoryUpdateSchema>
export type FaqCreateInput = z.infer<typeof faqCreateSchema>
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>
