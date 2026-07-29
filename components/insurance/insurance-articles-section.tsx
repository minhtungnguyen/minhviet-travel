import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { FlightArticleCard } from '@/components/flight/flight-article-card'
import type { InsuranceArticleTeaser } from '@/types/insurance'

/** Reuses `FlightArticleCard` — `InsuranceArticleTeaser` is the same `FlightArticle` shape, same reuse Combo already established for its own article rail. */
export function InsuranceArticlesSection({ articles }: { articles: InsuranceArticleTeaser[] }) {
  if (articles.length === 0) return null

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Kiến thức bảo hiểm" title="Bài viết nổi bật" description="Kinh nghiệm chọn gói, thủ tục bồi thường và các câu hỏi thường gặp về bảo hiểm du lịch." align="center" className="mx-auto max-w-2xl" />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={article.id} delay={index * 60}>
              <FlightArticleCard article={article} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/insurance/kien-thuc" className="link-underline inline-flex items-center gap-1.5 text-sm font-semibold text-mv-journey-blue">
            Xem tất cả bài viết <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
