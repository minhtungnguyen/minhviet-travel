import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { DestinationContent } from '@/types/homepage'

export function DestinationCard({ destination }: { destination: DestinationContent }) {
  return (
    <Link
      href={destination.href}
      className="group relative block aspect-[3/4] w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft sm:w-[300px]"
    >
      <Image
        src={destination.image.src}
        alt={destination.image.alt}
        fill
        sizes="300px"
        className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/90 via-mv-deep-navy/10 to-transparent transition-colors duration-mv-normal group-hover:from-mv-brand-blue/85" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <div>
          <h3 className="font-display text-2xl text-paper">{destination.name}</h3>
          <p className="text-sm text-paper/70">{destination.tagline}</p>
          <p className="mt-2 eyebrow text-[10px] text-paper/60">{destination.journeyCount} hành trình</p>
        </div>
        <ArrowUpRight className="size-5 text-paper transition-transform duration-mv-normal group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </Link>
  )
}
