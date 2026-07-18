import Image from 'next/image'
import { cn } from '@/lib/utils'

export type PartnerCardProps = {
  name: string
  logo?: string
  category?: string
  className?: string
}

/** Quiet, grayscale-first partner/logo mark — for trust bars and partner grids. */
export function PartnerCard({ name, logo, category, className }: PartnerCardProps) {
  return (
    <div
      className={cn(
        'ds-transition flex h-20 items-center justify-center rounded-ds-lg border border-ds-border-subtle bg-ds-surface-base px-6 grayscale opacity-70 hover:opacity-100 hover:grayscale-0',
        className,
      )}
    >
      {logo ? (
        <div className="relative h-8 w-full">
          <Image src={logo} alt={name} fill sizes="160px" className="object-contain" />
        </div>
      ) : (
        <span className="font-ds-heading text-base font-semibold text-ds-text-secondary">{name}</span>
      )}
      {category && <span className="sr-only">{category}</span>}
    </div>
  )
}
