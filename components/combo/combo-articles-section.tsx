import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { FlightArticleCard } from '@/components/flight/flight-article-card'
import type { FlightArticle } from '@/types/flight'

/**
 * Section 05 "Bài viết mới" — deliberately reuses `FlightArticleCard`
 * instead of a new card component, per brief "Reuse News Component,
 * không tạo Component mới." `ComboLandingContent.articles` is typed as
 * `FlightArticle` (see `types/combo.ts`), so this is a zero-adapter
 * cross-module reuse — same precedent as the flight branch importing
 * `components/homepage/reveal.tsx`.
 */
export function ComboArticlesSection({ articles }: { articles: FlightArticle[] }) {
  const visible = articles.filter((article) => article.isActive).sort((a, b) => a.order - b.order)

  if (visible.length === 0) return null

  return (
    <section className="bg-mv-ice-blue/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Bài viết mới" title="Đọc thêm trước khi lên lịch" />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.slice(0, 4).map((article, index) => (
            <Reveal key={article.id} delay={index * 60}>
              <FlightArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
