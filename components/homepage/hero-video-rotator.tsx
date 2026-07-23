'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const SCENES = [
  {
    video: '/videos/hero/ha-long-bay.mp4',
    poster: '/images/hero/ha-long-bay.jpg',
    alt: 'Flycam vịnh Hạ Long với các đảo đá vôi trải dài trên mặt biển xanh ngọc',
  },
  {
    video: '/videos/hero/sapa-terraces.mp4',
    poster: '/images/hero/sapa-terraces.jpg',
    alt: 'Flycam ruộng bậc thang Sa Pa mùa lúa xanh giữa núi rừng Tây Bắc',
  },
  {
    video: '/videos/hero/ninh-binh.mp4',
    poster: '/images/hero/ninh-binh.jpg',
    alt: 'Flycam núi đá vôi và sông nước Ninh Bình nhìn từ trên cao',
  },
] as const

const ROTATE_MS = 7000

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function getMotionEnabled() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Server/pre-hydration default: the static poster, never an autoplaying video. */
function getMotionEnabledServer() {
  return false
}

/**
 * Cycles through real drone footage of Vietnam (not stock/AI imagery) with a
 * crossfade. All clips stay mounted and playing so the incoming layer is
 * already in motion the moment it fades in — swapping `src` on a single
 * element would show a black frame while the next clip buffers.
 */
export function HeroVideoRotator() {
  const [active, setActive] = useState(0)
  const motionEnabled = useSyncExternalStore(
    subscribeReducedMotion,
    getMotionEnabled,
    getMotionEnabledServer,
  )
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    if (!motionEnabled) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SCENES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled) return
    const onVisibility = () => {
      for (const video of videoRefs.current) {
        if (!video) continue
        if (document.hidden) video.pause()
        else video.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [motionEnabled])

  if (!motionEnabled) {
    return (
      <Image
        src={SCENES[0].poster}
        alt={SCENES[0].alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    )
  }

  return (
    <>
      {SCENES.map((scene, i) => (
        <video
          key={scene.video}
          ref={(el) => {
            videoRefs.current[i] = el
          }}
          className={cn(
            'absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-in-out',
            i === active ? 'opacity-100' : 'opacity-0',
          )}
          poster={scene.poster}
          src={scene.video}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          aria-label={scene.alt}
        />
      ))}
    </>
  )
}
