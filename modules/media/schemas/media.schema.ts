import { z } from 'zod'
import { uuidSchema } from '@/shared/validation/common'

export const mediaFolderCreateSchema = z.object({
  websiteId: uuidSchema.optional(),
  parentFolderId: uuidSchema.optional(),
  name: z.string().min(1).max(200),
}).strict()

/**
 * `storagePath` is supplied by the caller (a future real upload flow
 * writes here after placing the object in Supabase Storage — not built
 * this sprint per spec §17) — never fabricated as a public URL here.
 */
export const mediaAssetCreateSchema = z.object({
  folderId: uuidSchema.optional(),
  websiteId: uuidSchema.optional(),
  originalFilename: z.string().min(1).max(300),
  storagePath: z.string().min(1).max(1000),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
  mimeType: z.string().min(1).max(150),
  fileSizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().optional(),
  altText: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
  credit: z.string().max(300).optional(),
  copyrightInfo: z.string().max(500).optional(),
  source: z.string().max(300).optional(),
  licenseStatus: z.string().max(100).optional(),
}).strict()

export const mediaAssetUpdateSchema = z.object({
  folderId: uuidSchema.nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  credit: z.string().max(300).nullable().optional(),
  copyrightInfo: z.string().max(500).nullable().optional(),
  source: z.string().max(300).nullable().optional(),
  licenseStatus: z.string().max(100).nullable().optional(),
  // Sprint 5B "Replace file" (Founder decision: overwrite in place, no
  // version history) — the new binary keeps the same id/storage_path, but
  // its own technical metadata (what changed) needs updating alongside it.
  originalFilename: z.string().min(1).max(300).optional(),
  mimeType: z.string().min(1).max(150).optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
}).strict()

export type MediaFolderCreateInput = z.infer<typeof mediaFolderCreateSchema>
export type MediaAssetCreateInput = z.infer<typeof mediaAssetCreateSchema>
export type MediaAssetUpdateInput = z.infer<typeof mediaAssetUpdateSchema>
