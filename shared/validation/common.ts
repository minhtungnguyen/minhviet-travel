import { z } from 'zod'

/** Shared primitives so every module's Zod schemas stay consistent. */
export const uuidSchema = z.string().uuid()
export const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated')
/** Like `slugSchema`, but for full page paths (e.g. News' `tin-tuc/xxx` prefix) that legitimately span multiple `/`-joined segments. */
export const pathSlugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, 'Slug must be lowercase, hyphen-separated path segments')
export const localeSchema = z.enum(['vi', 'en', 'zh', 'ko', 'ja'])
export const isoTimestampSchema = z.string().datetime()

export const generalStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
