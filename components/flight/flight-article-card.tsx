import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ArrowRight } from 'lucide-react'
import type { FlightArticle } from '@/types/flight'

export function FlightArticleCard({ article }: { article: FlightArticle }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={article.href} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 text-mv-journey-blue" />
          {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
        </p>
        <h3 className="mt-2 line-clamp-2 text-pretty font-display text-base leading-snug text-foreground">
          <Link href={article.href} className="transition-colors hover:text-mv-journey-blue">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{article.excerpt}</p>
        <Link
          href={article.href}
          className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mv-journey-blue"
        >
          Đọc tiếp <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}
