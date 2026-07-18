import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

type PageHeroCta = { label: string; href: string; variant?: 'primary' | 'gold' | 'outline-light' }

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  ctas,
}: {
  eyebrow: string
  title: string
  description?: string
  image?: string
  breadcrumb: string
  ctas?: PageHeroCta[]
}) {
  return (
    <section className="relative overflow-hidden bg-deep">
      <div className="absolute inset-0">
        {image ? (
          <>
            <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/70 to-deep/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-deep/50" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-deep to-deep" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_0%,rgb(53_169_224/0.16),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_10%_100%,rgb(199_168_107/0.12),transparent)]" />
          </>
        )}
      </div>

      <div className="container-mv relative flex min-h-[42vh] flex-col justify-end pt-32 pb-14 lg:min-h-[46vh] lg:pb-16">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-paper/55" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-paper">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-paper/80">{breadcrumb}</span>
        </nav>

        <p className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-gold">
          <span className="h-px w-10 bg-gold/50" />
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-2xl text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-paper sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-paper/70 sm:text-lg">
            {description}
          </p>
        )}

        {ctas && ctas.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <MVButton key={cta.label} href={cta.href} variant={cta.variant ?? 'primary'} size="lg">
                {cta.label}
              </MVButton>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
