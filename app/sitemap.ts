import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/seo'
import { tours } from '@/lib/site-data'

/**
 * Only lists routes that are actually implemented and publicly indexable.
 * Nav/footer links to not-yet-built pages (e.g. /services, /destinations,
 * /faq) are intentionally excluded — submitting a 404 to search engines is
 * worse than omitting it. Add each page here as it ships (see
 * PROJECT_AUDIT.md §6 "Module thiếu" for what's still pending).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tours`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/mice`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/hotels`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/cruises`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/flights`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/tickets`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/visa`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${SITE_URL}/tour/${tour.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...tourRoutes]
}
