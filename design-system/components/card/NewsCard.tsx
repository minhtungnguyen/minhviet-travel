import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { cardBaseClass } from './_shared'

export type NewsCardProps = {
  href: string
  image: string
  category?: string
  title: string
  excerpt?: string
  date?: string
  className?: string
}

export function NewsCard({ href, image, category, title, excerpt, date, className }: NewsCardProps) {
  return (
    <article className={cn(cardBaseClass, className)}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="ds-transition object-cover group-hover:opacity-95"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ds-interactive-default">
            {category}
          </span>
        )}
        <h3 className="mt-2 font-ds-heading text-base font-semibold leading-snug text-ds-text-primary">
          <Link href={href} className="ds-transition hover:text-ds-interactive-default">
            {title}
          </Link>
        </h3>
        {excerpt && <p className="mt-2 line-clamp-2 text-sm text-ds-text-secondary">{excerpt}</p>}
        {date && <p className="mt-3 text-xs text-ds-text-muted">{date}</p>}
      </div>
    </article>
  )
}
