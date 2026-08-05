import { z } from 'zod'
import { generalStatusSchema, localeSchema, slugSchema, uuidSchema } from '@/shared/validation/common'

const pageTypeSchema = z.enum([
  'HOME', 'SERVICE_HUB', 'LANDING_PAGE', 'STATIC_PAGE', 'PROGRAM_INSPIRATION',
  'ARTICLE_INDEX', 'PRODUCT_INDEX', 'CONTACT', 'POLICY', 'CUSTOM', 'TOUR',
])

export const cmsPageCreateSchema = z.object({
  websiteId: uuidSchema,
  locale: localeSchema,
  pageType: pageTypeSchema,
  slug: slugSchema,
}).strict()

export const cmsPageUpdateSchema = z.object({
  slug: slugSchema.optional(),
}).strict()

const blockInputSchema = z.object({
  blockDefinitionKey: z.string().min(1).max(60),
  position: z.number().int().min(0),
  config: z.record(z.string(), z.unknown()).default({}),
})

const sectionInputSchema = z.object({
  sectionKey: z.string().min(1).max(60),
  position: z.number().int().min(0),
  blocks: z.array(blockInputSchema).default([]),
})

/** Creates a new DRAFT version, optionally with its full section/block tree in one call. */
export const cmsPageVersionCreateSchema = z.object({
  title: z.string().min(1).max(300),
  sections: z.array(sectionInputSchema).default([]),
}).strict()

/** Body for POST /cms/pages/{id}/sections — the target version is resolved server-side (the page's latest). */
export const cmsSectionCreateSchema = z.object({
  sectionKey: z.string().min(1).max(60),
  position: z.number().int().min(0),
}).strict()

export const cmsSectionUpdateSchema = z.object({
  sectionKey: z.string().min(1).max(60).optional(),
  position: z.number().int().min(0).optional(),
}).strict()

export const cmsBlockCreateSchema = z.object({
  sectionId: uuidSchema,
  blockDefinitionKey: z.string().min(1).max(60),
  position: z.number().int().min(0),
  config: z.record(z.string(), z.unknown()).default({}),
}).strict()

export const cmsBlockUpdateSchema = z.object({
  position: z.number().int().min(0).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
}).strict()

export const publishVersionSchema = z.object({
  scheduledPublishAt: z.string().datetime().optional(),
}).strict()

export const announcementCreateSchema = z.object({
  websiteId: uuidSchema,
  message: z.string().min(1).max(500),
  linkHref: z.string().max(500).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).strict()

export const announcementUpdateSchema = announcementCreateSchema.omit({ websiteId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export type CmsPageCreateInput = z.infer<typeof cmsPageCreateSchema>
export type CmsPageUpdateInput = z.infer<typeof cmsPageUpdateSchema>
export type CmsPageVersionCreateInput = z.infer<typeof cmsPageVersionCreateSchema>
export type CmsSectionCreateInput = z.infer<typeof cmsSectionCreateSchema>
export type CmsSectionUpdateInput = z.infer<typeof cmsSectionUpdateSchema>
export type CmsBlockCreateInput = z.infer<typeof cmsBlockCreateSchema>
export type CmsBlockUpdateInput = z.infer<typeof cmsBlockUpdateSchema>
export type PublishVersionInput = z.infer<typeof publishVersionSchema>
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>
