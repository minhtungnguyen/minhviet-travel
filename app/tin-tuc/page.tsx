import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { listPublishedNews } from '@/lib/cms/news'

export const metadata: Metadata = { title: 'Tin tức | Minh Việt Travel' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'
const PAGE_SIZE = 12

export default async function TinTucIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const client = getPublicSupabaseClient()
  const { items, total } = await listPublishedNews(client, WEBSITE_ID, LOCALE, { page, pageSize: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <SiteChrome>
      <PageHero eyebrow="Minh Việt Travel" title="Tin tức" breadcrumb="Tin tức" />
      <div className="container-mv py-12">
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/30">
                  {item.image?.src && (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt || item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {item.pinned && (
                    <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-deep">Ghim</span>
                  )}
                  {item.hot && !item.pinned && (
                    <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
                      Hot
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {item.category && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.category}</p>}
                  <h2 className="mt-1.5 font-display text-lg font-bold text-foreground group-hover:text-primary">{item.title}</h2>
                  {item.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>}
                  {item.publishedAt && (
                    <p className="mt-3 text-xs text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={p === 1 ? '/tin-tuc' : `/tin-tuc?page=${p}`}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium ${
                  p === page ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-secondary/60'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteChrome>
  )
}
