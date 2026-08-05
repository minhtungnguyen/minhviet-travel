import { z } from 'zod'
import { generalStatusSchema, localeSchema, pathSlugSchema, uuidSchema } from '@/shared/validation/common'

export const seoMetadataPutSchema = z.object({
  websiteId: uuidSchema,
  locale: localeSchema,
  title: z.string().min(1).max(300),
  metaDescription: z.string().max(500).optional(),
  slug: pathSlugSchema,
  canonicalUrl: z.string().url().optional(),
  isIndexed: z.boolean().default(true),
  isFollowed: z.boolean().default(true),
  ogTitle: z.string().max(300).optional(),
  ogDescription: z.string().max(500).optional(),
  ogImageMediaId: uuidSchema.optional(),
  twitterCardType: z.string().max(50).optional(),
  featuredImageMediaId: uuidSchema.optional(),
  structuredData: z.record(z.string(), z.unknown()).default({}),
  breadcrumbConfig: z.array(z.unknown()).default([]),
  hreflangGroupId: uuidSchema.optional(),
}).strict()

export const redirectRuleCreateSchema = z.object({
  websiteId: uuidSchema,
  locale: localeSchema.optional(),
  sourcePath: z.string().min(1).max(500).regex(/^\//, 'sourcePath must start with /'),
  destinationUrl: z.string().min(1).max(1000),
  redirectKind: z.enum(['301', '302']).default('301'),
}).strict()

export const redirectRuleUpdateSchema = redirectRuleCreateSchema.omit({ websiteId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export type SeoMetadataPutInput = z.infer<typeof seoMetadataPutSchema>
export type RedirectRuleCreateInput = z.infer<typeof redirectRuleCreateSchema>
export type RedirectRuleUpdateInput = z.infer<typeof redirectRuleUpdateSchema>
