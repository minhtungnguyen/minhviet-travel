'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { CalendarDays, MapPin, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'

const TABS = [
  { value: 'group', label: 'Tour đoàn' },
  { value: 'mice', label: 'MICE & Sự kiện' },
  { value: 'ai', label: 'Hỏi AI' },
] as const

/**
 * Real, working search — the audit's most critical finding was that the
 * previous hero search bar had no submit handler at all. This one
 * navigates to `/tours` with the entered criteria, or jumps straight to
 * the AI Advisor section when that tab is active.
 */
export function SmartSearchBar() {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('group')
  const [destination, setDestination] = useState('')
  const [dates, setDates] = useState('')
  const [guests, setGuests] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (tab === 'ai') {
      document.getElementById('ai-advisor')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (dates) params.set('dates', dates)
    if (guests) params.set('guests', guests)
    params.set('type', tab)

    router.push(`${ROUTES.tours}?${params.toString()}`)
  }

  return (
    <div className="w-full text-left">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTab key={t.value} value={t.value}>
              {t.label}
            </TabsTab>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsPanel key={t.value} value={t.value}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl rounded-tl-none border border-border bg-card p-2 shadow-soft-lg"
            >
              {t.value === 'ai' ? (
                <div className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Trả lời 3 câu hỏi để nhận gợi ý hành trình có giải thích, thẩm định bởi chuyên viên.
                  </p>
                  <Button type="submit" size="lg">
                    Bắt đầu <Search className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border lg:flex-row lg:items-stretch lg:divide-x lg:divide-y-0">
                  <label className="group flex flex-1 items-center gap-3 px-4 py-3">
                    <MapPin className="size-5 shrink-0 text-accent" />
                    <span className="flex-1">
                      <span className="eyebrow block text-[10px] font-semibold text-muted-foreground">
                        Điểm đến
                      </span>
                      <Input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Bạn muốn đi đâu?"
                        className="h-auto border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                      />
                    </span>
                  </label>
                  <label className="group flex flex-1 items-center gap-3 px-4 py-3">
                    <CalendarDays className="size-5 shrink-0 text-accent" />
                    <span className="flex-1">
                      <span className="eyebrow block text-[10px] font-semibold text-muted-foreground">
                        Thời gian
                      </span>
                      <Input
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        placeholder="Ngày đi — Ngày về"
                        className="h-auto border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                      />
                    </span>
                  </label>
                  <label className="group flex flex-1 items-center gap-3 px-4 py-3">
                    <Users className="size-5 shrink-0 text-accent" />
                    <span className="flex-1">
                      <span className="eyebrow block text-[10px] font-semibold text-muted-foreground">
                        Số khách
                      </span>
                      <Input
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        placeholder="Số lượng khách"
                        className="h-auto border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                      />
                    </span>
                  </label>
                  <div className="flex items-center p-1.5">
                    <Button type="submit" size="lg" className="w-full shrink-0 lg:h-[58px] lg:w-auto lg:px-9">
                      <Search className="size-5" />
                      Tìm kiếm
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  )
}
