import Link from 'next/link'
import { Info, TriangleAlert } from 'lucide-react'
import { Meter } from '@/components/ui/meter'
import { Badge } from '@/components/ui/badge'
import type { AIAdvisorActionState } from '@/types/ai-advisor'
import type { ConfidenceLevel } from '@/types/cms'

const CONFIDENCE_COPY: Record<ConfidenceLevel, { label: string; meterValue: number; variant: 'success' | 'warning' | 'neutral' }> = {
  high: { label: 'Phù hợp cao', meterValue: 100, variant: 'success' },
  medium: { label: 'Phù hợp trung bình', meterValue: 66, variant: 'warning' },
  low: { label: 'Phù hợp một phần', meterValue: 33, variant: 'neutral' },
}

/**
 * Every result surfaced here states its basis and its gaps — no bare
 * percentage, no result presented as a confirmed booking. This is the
 * direct replacement for the old AI panel's fabricated 96%/91%/88%
 * scores (Volume 02 Ch.17.7) and carries the Volume 01 Article 3
 * confidence-disclosure requirement into the UI.
 */
export function AIAdvisorResult({ state }: { state: AIAdvisorActionState }) {
  if (state.status === 'idle') {
    return (
      <p className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        Trả lời ba câu hỏi để nhận gợi ý hành trình có giải thích.
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p>{state.message}</p>
      </div>
    )
  }

  const { matches } = state.result

  if (matches.length === 0) {
    return (
      <div aria-live="polite" className="rounded-xl border border-border bg-secondary/40 p-5 text-sm">
        <p className="font-semibold text-foreground">Chưa tìm thấy hành trình khớp hoàn toàn.</p>
        <p className="mt-1 text-muted-foreground">
          Chuyên viên Minh Việt sẽ tư vấn trực tiếp phương án phù hợp với nhu cầu của bạn.
        </p>
        <Link href="/contact?intent=ai-advisor" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
          Nói chuyện với chuyên viên
        </Link>
      </div>
    )
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-4">
      <div
        role="note"
        className="flex items-start gap-2.5 rounded-xl border border-royal/20 bg-royal/5 p-3.5 text-xs text-foreground/80"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-royal" />
        <p>Đây là gợi ý từ AI, chuyên viên sẽ xác nhận trước khi triển khai.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {matches.map((match) => {
          const confidence = CONFIDENCE_COPY[match.confidence]
          return (
            <li key={match.journeyId} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={match.href} className="font-display text-base font-semibold text-foreground hover:text-primary">
                  {match.title}
                </Link>
                <Badge variant={confidence.variant}>{confidence.label}</Badge>
              </div>
              <Meter
                value={confidence.meterValue}
                valueText={confidence.label}
                className="mt-3"
                aria-label={`Mức độ phù hợp: ${match.title}`}
              />
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {match.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
              {match.unmatchedCriteria.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground/80">
                  Chưa khớp: {match.unmatchedCriteria.join(', ')}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <Link
        href="/contact?intent=ai-advisor"
        className="inline-flex w-fit text-sm font-semibold text-primary hover:underline"
      >
        Nói chuyện với chuyên viên
      </Link>
    </div>
  )
}
