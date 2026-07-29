'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { CmsImage } from '@/types/cms'

/**
 * Video-with-fallback hero background. Pattern-copied (not imported)
 * from the not-yet-merged `design/flight-homepage-experience` branch's
 * `flight-hero-media.tsx` — same `useSyncExternalStore` trick (the
 * server-side subscription always reports motion disabled, so the first
 * client paint matches the server render and never hydration-mismatches
 * on `prefers-reduced-motion`). Combo's version takes `video` as a prop
 * sourced from CMS content instead of a hardcoded placeholder path,
 * since the brief requires "Hero Video lấy từ CMS."
 */
function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function getMotionEnabled() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getMotionEnabledServer() {
  return false
}

export function ComboHeroMedia({
  video,
  poster,
  className,
}: {
  video?: string
  poster: CmsImage
  className?: string
}) {
  const [videoFailed, setVideoFailed] = useState(false)
  const motionEnabled = useSyncExternalStore(subscribeReducedMotion, getMotionEnabled, getMotionEnabledServer)

  const showVideo = motionEnabled && video && !videoFailed

  if (!showVideo) {
    return (
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        priority
        sizes="100vw"
        className={cn('object-cover object-center', className)}
      />
    )
  }

  return (
    <video
      className={cn('absolute inset-0 size-full object-cover object-center', className)}
      poster={poster.src}
      src={video}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      aria-label={poster.alt}
      onError={() => setVideoFailed(true)}
    />
  )
}
