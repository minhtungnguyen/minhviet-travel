import 'server-only'
import { cache } from 'react'
import { homepageContentSeed } from '@/lib/cms/content/homepage.seed'
import { homepageContentSchema } from '@/lib/cms/schema'
import type { HomepageContent } from '@/types/homepage'

/**
 * The single seam a real CMS integration needs to replace. Every
 * homepage section server component calls `getHomepageContent()` and
 * depends only on the `HomepageContent` type — swap the body below for
 * a Sanity/Contentful/Supabase fetch and nothing else in `sections/` or
 * `components/homepage/` needs to change.
 *
 * `cache()` de-dupes the fetch across the multiple section components
 * that each read their own slice of the same content within one
 * request/render pass.
 */
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  const raw: unknown = homepageContentSeed
  return homepageContentSchema.parse(raw)
})
