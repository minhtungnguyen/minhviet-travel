import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Official Minh Việt Travel logo lockup.
 * On light surfaces the full-color logo is used directly.
 * On dark surfaces (`onDark`), it sits on a soft white chip so the
 * navy wordmark and blue mark stay legible.
 */
export function Logo({
  className,
  height = 48,
  onDark = false,
}: {
  className?: string
  height?: number
  onDark?: boolean
}) {
  const ratio = 1.415
  const width = Math.round(height * ratio)

  const img = (
    <Image
      src="/logo-minhviet.png"
      alt="Minh Việt Travel — Khám phá cảm xúc bất tận"
      width={width}
      height={height}
      priority
      className="w-auto object-contain"
      style={{ height, width: 'auto' }}
    />
  )

  if (onDark) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-sm',
          className,
        )}
      >
        {img}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center select-none', className)}>
      {img}
    </span>
  )
}
