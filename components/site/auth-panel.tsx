import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, MapPinned, MessageSquareText, Receipt } from 'lucide-react'
import { Logo } from '@/components/mv/logo'

const highlights = [
  { icon: MapPinned, label: 'Quản lý hành trình' },
  { icon: MessageSquareText, label: 'Gửi yêu cầu tư vấn doanh nghiệp' },
  { icon: Receipt, label: 'Theo dõi báo giá và booking' },
]

export function AuthPanel({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <section className="bg-background pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-20">
      <div className="container-mv">
        <div className="grid overflow-hidden rounded-3xl shadow-soft-lg lg:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-deep p-10 lg:flex">
            <Image
              src="/editorial-hero.webp"
              alt=""
              fill
              sizes="50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/58 via-deep/40 to-deep/20" />
            <div className="relative">
              <Logo onDark height={40} />
            </div>
            <div className="relative">
              <ShieldCheck className="size-6 text-gold" />
              <p className="mt-4 max-w-sm text-pretty font-display text-xl leading-snug text-paper">
                Cổng khách hàng doanh nghiệp — mọi hành trình, hóa đơn và yêu cầu tư vấn tại một nơi.
              </p>
              <ul className="mt-6 space-y-3">
                {highlights.map((h) => {
                  const Icon = h.icon
                  return (
                    <li key={h.label} className="flex items-center gap-3 text-sm text-paper/85">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-gold">
                        <Icon className="size-4" />
                      </span>
                      {h.label}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-paper/50">
                Enterprise Travel &amp; MICE
              </p>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex flex-col bg-card p-8 sm:p-12">
            <div className="mx-auto w-full max-w-[560px]">
              <Link href="/" className="mb-6 inline-flex lg:hidden">
                <Logo height={38} />
              </Link>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              <div className="mt-6">{children}</div>
              <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
