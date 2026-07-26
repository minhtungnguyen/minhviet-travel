import { z } from 'zod'
import { generalStatusSchema, localeSchema, uuidSchema } from '@/shared/validation/common'

const menuKeySchema = z.enum(['HEADER', 'FOOTER', 'MOBILE', 'SERVICE', 'LEGAL', 'SOCIAL', 'ANNOUNCEMENT_BAR'])

export const navigationMenuCreateSchema = z.object({
  websiteId: uuidSchema,
  key: menuKeySchema,
  locale: localeSchema,
}).strict()

export const navigationMenuUpdateSchema = z.object({
  status: generalStatusSchema.optional(),
}).strict()

/**
 * A target is exactly one of: internal `cmsPageId`, external `url`, or
 * neither (a pure grouping label with children) — mirrors the DB check
 * constraint `navigation_items_target_chk`
 * (database/migrations/0010_navigation.sql), validated here too so a bad
 * combination fails with a clear message instead of a raw constraint error.
 */
export const navigationItemCreateSchema = z
  .object({
    parentItemId: uuidSchema.optional(),
    label: z.string().min(1).max(200),
    url: z.string().max(500).optional(),
    cmsPageId: uuidSchema.optional(),
    isExternal: z.boolean().default(false),
    openInNewTab: z.boolean().default(false),
    position: z.number().int().min(0).default(0),
  })
  .strict()
  .refine((v) => !(v.url && v.cmsPageId), { message: 'Provide either url or cmsPageId, not both' })

export const navigationItemUpdateSchema = z
  .object({
    parentItemId: uuidSchema.nullable().optional(),
    label: z.string().min(1).max(200).optional(),
    url: z.string().max(500).nullable().optional(),
    cmsPageId: uuidSchema.nullable().optional(),
    isExternal: z.boolean().optional(),
    openInNewTab: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
    status: generalStatusSchema.optional(),
  })
  .strict()
  .refine((v) => !(v.url && v.cmsPageId), { message: 'Provide either url or cmsPageId, not both' })

export type NavigationMenuCreateInput = z.infer<typeof navigationMenuCreateSchema>
export type NavigationMenuUpdateInput = z.infer<typeof navigationMenuUpdateSchema>
export type NavigationItemCreateInput = z.infer<typeof navigationItemCreateSchema>
export type NavigationItemUpdateInput = z.infer<typeof navigationItemUpdateSchema>
