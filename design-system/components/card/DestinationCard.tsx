import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DestinationCardProps = {
  href: string
  image: string
  name: string
  tagline?: string
  stat?: string
  className?: string
}

/** Full-bleed image card with a dark scrim footer — for destination/place browsing. */
export function DestinationCard({ href, image, name, tagline, stat, className }: DestinationCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'ds-transition group relative block aspect-[3/4] overflow-hidden rounded-ds-xl shadow-ds-soft hover:shadow-ds-medium',
        className,
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="300px"
        className="ds-transition object-cover group-hover:opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ds-neutral-900/85 via-ds-neutral-900/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
        <div>
          <h3 className="font-ds-heading text-lg font-semibold text-ds-text-inverse">{name}</h3>
          {tagline && <p className="text-sm text-ds-neutral-200">{tagline}</p>}
          {stat && <p className="mt-1 text-xs uppercase tracking-wide text-ds-neutral-300">{stat}</p>}
        </div>
        <ArrowUpRight className="ds-transition size-5 shrink-0 text-ds-text-inverse group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  )
}
