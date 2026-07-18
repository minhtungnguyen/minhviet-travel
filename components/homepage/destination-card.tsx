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
        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <div>
          <h3 className="font-display text-2xl text-paper">{destination.name}</h3>
          <p className="text-sm text-paper/70">{destination.tagline}</p>
          <p className="mt-2 eyebrow text-[10px] text-paper/60">{destination.journeyCount} hành trình</p>
        </div>
        <ArrowUpRight className="size-5 text-paper transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  )
}
