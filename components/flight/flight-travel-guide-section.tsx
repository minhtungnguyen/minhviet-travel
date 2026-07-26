import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { FlightArticleCard } from '@/components/flight/flight-article-card'
import type { FlightArticle } from '@/types/flight'

export function FlightTravelGuideSection({ articles }: { articles: FlightArticle[] }) {
  const activeArticles = articles
    .filter((article) => article.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4)

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader eyebrow="Cẩm nang bay" title="Kinh nghiệm và mẹo hay khi đi máy bay" className="max-w-2xl" />

        {activeArticles.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Bài viết đang được cập nhật.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activeArticles.map((article) => (
              <Reveal key={article.id}>
                <FlightArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
