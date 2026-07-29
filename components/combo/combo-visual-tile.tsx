import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CmsImage } from '@/types/cms'

/**
 * Shared photo tile for Section 02 "Chọn theo nhu cầu" and Section 03
 * "Destination Explorer" — same card DNA as
 * `components/homepage/destination-card.tsx` (image + bottom gradient +
 * caption, hover scale) but kept local to the combo module rather than
 * modifying that shared homepage component. Deliberately no icon, no
 * flip — real photo + label only, per brief.
 */
export function ComboVisualTile({
  image,
  title,
  subtitle,
  meta,
  href,
  size = 'sm',
}: {
  image: CmsImage
  title: string
  subtitle?: string
  /** Small stat line shown under the subtitle on the 'lg' variant, e.g. "3 hành trình Combo". */
  meta?: string
  href: string
  size?: 'sm' | 'lg'
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-2xl border-2 border-transparent shadow-soft transition-colors duration-mv-normal hover:border-mv-combo-sunset',
        size === 'lg' ? 'aspect-[4/3]' : 'aspect-[3/4]',
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={size === 'lg' ? '(min-width: 1024px) 32vw, 100vw' : '(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw'}
        className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/85 via-mv-deep-navy/10 to-transparent transition-colors duration-mv-normal group-hover:from-mv-brand-blue/80" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className={cn('font-display text-paper', size === 'lg' ? 'text-2xl' : 'text-base')}>{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-paper/70">{subtitle}</p>}
        {meta && size === 'lg' && (
          <p className="mt-2 eyebrow text-[10px] text-paper/60">{meta}</p>
        )}
      </div>
    </Link>
  )
}
