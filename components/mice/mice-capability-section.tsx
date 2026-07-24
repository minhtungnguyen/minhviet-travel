import {
  UserCheck,
  ClipboardList,
  Network,
  Wallet,
  CalendarClock,
  Repeat,
  LifeBuoy,
  ClipboardCheck,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { VerifiedStat } from '@/components/homepage/verified-stat'
import type { MiceLandingContent } from '@/types/mice'

const ICONS: LucideIcon[] = [UserCheck, ClipboardList, Network, Wallet, CalendarClock, Repeat, LifeBuoy, ClipboardCheck, HeartHandshake]

export function MiceCapabilitySection({
  points,
  stats,
}: {
  points: MiceLandingContent['capabilityPoints']
  stats: MiceLandingContent['verifiedStats']
}) {
  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-deep-navy">
      <div className="container-mv">
        <SectionHeader eyebrow="Năng lực vận hành" title="Đủ hệ thống để vận hành, đủ tận tâm để đồng hành" onDark className="max-w-2xl" />

        {stats.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-white/10 pb-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <VerifiedStat key={stat.id} stat={stat} onDark />
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => {
            const Icon = ICONS[i] ?? UserCheck
            return (
              <Reveal key={point.id} delay={(i % 3) * 60}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-mv-sky-cyan">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-paper">{point.title}</h3>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-paper/65">{point.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
