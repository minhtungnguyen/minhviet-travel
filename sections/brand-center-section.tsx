import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export async function BrandCenterSection() {
  const { brandCenter } = await getHomepageContent()
  const [featured, ...rest] = brandCenter.stories

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={brandCenter.eyebrow}
            title={brandCenter.title}
            description={brandCenter.description}
            className="max-w-2xl"
          />
          <Button
            variant="outline"
            size="default"
            className="hidden shrink-0 md:inline-flex"
            render={<Link href={brandCenter.cta.href} />}
          >
            {brandCenter.cta.label} <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Link
              href={featured.href}
              className="group relative flex h-full min-h-[380px] flex-col justify-end overflow-hidden rounded-2xl"
            >
              <Image
                src={featured.image.src}
                alt={featured.image.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/95 via-mv-deep-navy/40 to-transparent" />
              <div className="relative p-7 sm:p-9">
                <Badge variant="accent">{featured.category}</Badge>
                <h3 className="mt-3 text-balance text-2xl font-bold text-white sm:text-3xl">{featured.title}</h3>
                <p className="mt-2 max-w-lg text-pretty text-white/75">{featured.description}</p>
              </div>
            </Link>
          </Reveal>

          <div className="grid gap-4">
            {rest.map((story, i) => (
              <Reveal key={story.id} delay={i * 0.08}>
                <Link
                  href={story.href}
                  className="group flex overflow-hidden rounded-2xl border border-transparent bg-card shadow-soft transition-all duration-mv-normal ease-mv-standard hover:-translate-y-0.5 hover:border-mv-sky-cyan hover:shadow-soft-lg"
                >
                  <div className="relative aspect-square w-32 shrink-0 overflow-hidden sm:w-44">
                    <Image
                      src={story.image.src}
                      alt={story.image.alt}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-5">
                    <Badge variant="neutral" className="w-fit">
                      {story.category}
                    </Badge>
                    <h3 className="mt-1.5 line-clamp-2 font-bold text-mv-deep-navy group-hover:text-mv-journey-blue">
                      {story.title}
                    </h3>
                    <div className="mt-1.5 flex items-center justify-end">
                      <ArrowUpRight className="size-4 text-mv-slate/60 transition-all duration-mv-normal group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-mv-journey-blue" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center md:hidden">
          <Button variant="outline" size="default" render={<Link href={brandCenter.cta.href} />}>
            {brandCenter.cta.label} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
