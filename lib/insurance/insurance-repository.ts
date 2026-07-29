import 'server-only'
import { cache } from 'react'
import { insuranceContentSeed } from '@/lib/insurance/insurance-content-seed'
import { insuranceArticlesSeed } from '@/lib/insurance/insurance-articles-seed'
import { insuranceLandingContentSchema, insuranceArticleSchema } from '@/lib/insurance/insurance-schema'
import type { InsuranceArticle, InsuranceArticleTeaser, InsuranceFaqItem, InsuranceLandingContent } from '@/types/insurance'

/**
 * The single seam a real CMS integration needs to replace — mirrors
 * `lib/combo/combo-repository.ts`. Every /insurance and
 * /insurance/kien-thuc component calls this and depends only on
 * `InsuranceLandingContent`/`InsuranceArticle`, never a raw seed file.
 *
 * TODO: Replace with CMS Provider — swap the two `cache()`-wrapped
 * functions below for a real CMS/DB-backed fetch; every function
 * signature below is the contract a CMS implementation must satisfy.
 */

export const getInsuranceLandingContent = cache(async (): Promise<InsuranceLandingContent> => {
  const raw: unknown = insuranceContentSeed
  return insuranceLandingContentSchema.parse(raw)
})

export const getInsuranceArticles = cache(async (): Promise<InsuranceArticle[]> => {
  const raw: unknown = insuranceArticlesSeed
  return insuranceArticleSchema.array().parse(raw)
})

export async function getInsuranceArticleBySlug(slug: string): Promise<InsuranceArticle | null> {
  const articles = await getInsuranceArticles()
  return articles.find((article) => article.slug === slug) ?? null
}

function bySortOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order
}

export function getActiveFaqs(content: InsuranceLandingContent): InsuranceFaqItem[] {
  return content.faqs.filter((faq) => faq.isActive).sort(bySortOrder)
}

/**
 * Teasers are derived from the full articles, not hand-duplicated in the
 * content seed — a title/excerpt/image can never drift between an
 * article's teaser card and its own detail page.
 */
export function toArticleTeaser(article: InsuranceArticle): InsuranceArticleTeaser {
  const { id, slug, title, excerpt, image, publishedAt, href, order, isActive } = article
  return { id, slug, title, excerpt, image, publishedAt, href, order, isActive }
}

export async function getActiveArticleTeasers(): Promise<InsuranceArticleTeaser[]> {
  const articles = await getInsuranceArticles()
  return articles
    .filter((article) => article.isActive)
    .sort(bySortOrder)
    .map(toArticleTeaser)
}
