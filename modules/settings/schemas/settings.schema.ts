import { z } from 'zod'
import { uuidSchema } from '@/shared/validation/common'

export const scopeLevelSchema = z.enum(['GLOBAL', 'ORGANIZATION', 'BRAND', 'WEBSITE', 'USER'])

export const settingValuePutSchema = z.object({
  scopeLevel: scopeLevelSchema,
  scopeResourceId: uuidSchema.nullable(),
  // Value shape is validated against the definition's value_type at the
  // service layer (settings.service.ts) — a bare Zod `unknown` here since
  // the acceptable shape depends on which definition this targets, which
  // isn't known until the route resolves {namespace}/{key}.
  value: z.unknown(),
}).strict()

export const settingValueDeleteQuerySchema = z.object({
  scopeLevel: scopeLevelSchema,
  scopeResourceId: uuidSchema.optional(),
})

export type SettingValuePutInput = z.infer<typeof settingValuePutSchema>
