'use client'

import { useEffect, useRef, useState } from 'react'
import { whyStats } from '@/lib/site-data'
import { CountUp } from '@/components/mv/count-up'
import { cn } from '@/lib/utils'

/** Split "5000+" -> { num: 5000, suffix: "+" }; non-numeric like "24/7" stays static */
function parseStat(value: string) {
  const match = value.match(/^(\d+)(.*)$/)
  if (!match || value.includes('/')) return null
  return { num: Number(match[1]), suffix: match[2] }
}

export function WhyChoose() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-deep py-20 lg:py-24">
      <div className="container-mv" ref={ref}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-paper/60">
              <span className="h-px w-8 bg-paper/40" />
              Vì sao chọn Minh Việt
            </p>
            <h2 className="mt-5 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
              Được tin tưởng bởi hàng nghìn doanh nghiệp
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-paper/70">
              Hơn một thập kỷ đồng hành, chúng tôi biến mỗi hành trình thành trải
              nghiệm trọn vẹn — chuyên nghiệp, tận tâm và đẳng cấp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {whyStats.map((s, i) => {
              const Icon = s.icon
              const parsed = parseStat(s.value)
              return (
                <div
                  key={s.label}
                  className={cn(
                    'group border-t border-paper/20 pt-5 transition-all duration-700',
                    visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  )}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <Icon
                    className="size-5 text-sky transition-transform duration-500 group-hover:scale-125"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="mt-4 text-4xl font-extrabold tracking-tight text-paper lg:text-5xl">
                    {parsed ? (
                      <CountUp value={parsed.num} suffix={parsed.suffix} separator />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className="mt-1 text-sm text-paper/60">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
