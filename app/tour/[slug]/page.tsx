import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin, Star, Users } from 'lucide-react'
import { tours } from '@/lib/site-data'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { TourCard } from '@/components/site/tour-card'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tour = tours.find((t) => t.id === slug)
  if (!tour) return { title: 'Không tìm thấy hành trình | Minh Việt Travel' }
  return {
    title: `${tour.title} | Minh Việt Travel`,
    description: `${tour.duration} · Khởi hành từ ${tour.departure}. Giá từ ${tour.price}.`,
  }
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = tours.find((t) => t.id === slug)
  if (!tour) notFound()

  const related = tours.filter((t) => t.id !== tour.id && t.category === tour.category).slice(0, 3)

  return (
    <SiteChrome>
      <PageHero
        eyebrow={`${tour.country} · ${tour.category}`}
        title={tour.title}
        breadcrumb={tour.title}
        image={tour.image}
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="container-mv grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <Reveal>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                <Clock className="size-4 text-royal" /> {tour.duration}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                <MapPin className="size-4 text-royal" /> Khởi hành: {tour.departure}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                <CalendarDays className="size-4 text-royal" /> {tour.date}
              </span>
              {tour.rating ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                  <Star className="size-4 fill-gold text-gold" /> {tour.rating.toFixed(1)}/5
                </span>
              ) : null}
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold text-foreground">Lịch trình chi tiết</h2>
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="font-display text-lg text-foreground">Lịch trình đang được biên soạn</p>
              <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                Đây là hành trình được tổ chức riêng theo yêu cầu. Vui lòng liên hệ chuyên viên
                tư vấn của Minh Việt để nhận lịch trình chi tiết, báo giá và các lựa chọn tùy chỉnh.
              </p>
              <MVButton href="/contact" variant="primary" size="md" className="mt-6">
                Nhận tư vấn giải pháp
              </MVButton>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="sticky top-24 rounded-3xl bg-card p-7 shadow-soft-lg">
              <p className="eyebrow text-[11px] font-semibold text-muted-foreground">
                {tour.originalPrice ? 'Giá ưu đãi' : 'Giá từ'}
              </p>
              {tour.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">{tour.originalPrice}</p>
              )}
              <p className="mt-1 font-display text-3xl font-extrabold text-primary">{tour.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">/ khách</p>

              <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-foreground">
                <li className="flex items-center gap-2.5">
                  <Users className="size-4 text-royal" /> {tour.seats}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-royal" /> Điểm đi: {tour.departure}
                </li>
              </ul>

              <MVButton href="/contact" variant="gold" size="lg" className="mt-7 w-full">
                Nhận tư vấn giải pháp
              </MVButton>
              <MVButton href="tel:0934368132" variant="outline" size="lg" className="mt-3 w-full">
                Gọi hotline 24/7
              </MVButton>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-16 lg:py-20">
          <div className="container-mv">
            <h2 className="font-display text-2xl font-bold text-foreground">Hành trình liên quan</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  )
}
