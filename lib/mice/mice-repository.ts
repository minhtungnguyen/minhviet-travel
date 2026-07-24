import 'server-only'
import { cache } from 'react'
import { miceLandingContentSeed } from '@/lib/mice/mice-data'
import { getHomepageContent } from '@/lib/cms/client'
import type { MiceLandingContent } from '@/types/mice'

/**
 * The seam a real CMS integration needs to replace — mirrors
 * `lib/cms/client.ts`'s `getHomepageContent()`. Every /mice section
 * component calls this and depends only on `MiceLandingContent`.
 *
 * Verified stats are merged in from the same `getHomepageContent()` the
 * Homepage already renders (`hero.proofStat` = 15+ years,
 * `trustStrip.stats[0]` = 5.000+ doanh nghiệp) so there is exactly one
 * source of truth. The "300+ chương trình MICE" stat
 * (`enterpriseMice.proofStat`) is deliberately excluded — its only
 * citation is an internal ops report with no external verification
 * trail, and this task's brief explicitly calls for not propagating an
 * unverified figure to a new page. See
 * MICE_LANDING_PAGE_SPEC_AND_IMPLEMENTATION.md.
 */
export const getMiceLandingContent = cache(async (): Promise<MiceLandingContent> => {
  const { hero, trustStrip } = await getHomepageContent()
  return {
    ...miceLandingContentSeed,
    verifiedStats: [hero.proofStat, trustStrip.stats[0]].filter(Boolean),
  }
})
