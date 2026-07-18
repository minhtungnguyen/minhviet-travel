'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { useAIAdvisor } from '@/hooks/use-ai-advisor'
import { cn } from '@/lib/utils'
import type { AIAdvisorQuestion } from '@/types/homepage'
import { AIAdvisorResult } from '@/components/homepage/ai-advisor-result'

/**
 * Renders all three questions at once on `md:` and above (matches the
 * Desktop Wireframe), but only the current step on smaller viewports
 * (matches the Mobile Layout's one-question-per-screen spec). Every
 * field stays mounted at all times — only visually hidden via CSS — so
 * its Base UI Select hidden input keeps contributing to the submitted
 * FormData regardless of which step is showing.
 */
export function AIAdvisorForm({ questions }: { questions: AIAdvisorQuestion[] }) {
  const fieldOrder = questions.map((q) => q.id)
  const advisor = useAIAdvisor(fieldOrder)

  return (
    <div className="flex flex-col gap-6">
      <form action={advisor.formAction} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(index === advisor.stepIndex ? 'block' : 'hidden', 'md:block')}
            >
              <Field name={question.id}>
                <FieldLabel>{question.label}</FieldLabel>
                <Select
                  name={question.id}
                  value={advisor.values[question.id] ?? null}
                  onValueChange={(value) => advisor.setValue(question.id, value as string)}
                >
                  <SelectTrigger aria-label={question.label}>
                    <SelectValue placeholder={question.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={advisor.goBack}
            disabled={advisor.stepIndex === 0}
          >
            Quay lại
          </Button>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Bước {advisor.stepIndex + 1}/{advisor.stepCount}
          </p>
          {advisor.isLastStep ? (
            <Button type="submit" size="sm" disabled={!advisor.canAdvance || advisor.isPending}>
              {advisor.isPending ? 'Đang xử lý...' : 'Xem gợi ý'}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={advisor.goNext} disabled={!advisor.canAdvance}>
              Tiếp tục
            </Button>
          )}
        </div>

        <div className="hidden md:block">
          <Button
            type="submit"
            size="lg"
            disabled={fieldOrder.some((field) => !advisor.values[field]) || advisor.isPending}
          >
            {advisor.isPending ? 'Đang xử lý...' : 'Xem gợi ý'}
          </Button>
        </div>
      </form>

      <AIAdvisorResult state={advisor.state} />
    </div>
  )
}
