import type { Metadata } from 'next'
import Link from 'next/link'
import { getMiceLandingContent } from '@/lib/mice/mice-repository'
import { SiteChrome } from '@/components/site/site-chrome'
import { MiceHero } from '@/components/mice/mice-hero'
import { MiceDefinitionSection } from '@/components/mice/mice-definition-section'
import { MiceObjectivesSection } from '@/components/mice/mice-objectives-section'
import { MiceSolutionsSection } from '@/components/mice/mice-solutions-section'
import { MiceBenefitsSection } from '@/components/mice/mice-benefits-section'
import { MiceProcessSection } from '@/components/mice/mice-process-section'
import { MiceComponentsSection } from '@/components/mice/mice-components-section'
import { MiceProgramIdeasSection } from '@/components/mice/mice-program-ideas-section'
import { MiceCaseStudySection } from '@/components/mice/mice-case-study-section'
import { MiceMediaSection } from '@/components/mice/mice-media-section'
import { MiceCapabilitySection } from '@/components/mice/mice-capability-section'
import { MiceFaqSection } from '@/components/mice/mice-faq-section'
import { MiceFinalCta } from '@/components/mice/mice-final-cta'
import { MiceConsultationForm } from '@/components/mice/mice-consultation-form'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getMiceLandingContent()
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalPath },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `https://www.minhviettravel.com${seo.canonicalPath}`,
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: seo.ogImage }],
    },
  }
}

/** Related-links row — internal linking for SEO (brief §XIX) to routes that don't have a natural anchor elsewhere on the page. */
function RelatedLinks() {
  const links = [
    { label: 'Tour thiết kế riêng', href: '/tour-thiet-ke' },
    { label: 'Khách sạn', href: '/hotels' },
    { label: 'Du thuyền', href: '/cruises' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Hồ sơ năng lực', href: '/about' },
  ]
  return (
    <div className="border-t border-border bg-background py-8">
      <div className="container-mv flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold text-mv-deep-navy">Tìm hiểu thêm:</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-mv-journey-blue hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function MicePage() {
  const content = await getMiceLandingContent()

  return (
    <SiteChrome>
      <MiceHero hero={content.hero} />
      <MiceDefinitionSection solutions={content.solutions} />
      <MiceObjectivesSection objectives={content.objectives} />
      <MiceSolutionsSection solutions={content.solutions} />
      <MiceBenefitsSection categories={content.benefitCategories} />
      <MiceProcessSection steps={content.process} />
      <MiceComponentsSection groups={content.componentGroups} />
      <MiceProgramIdeasSection ideas={content.programIdeas} />
      <MiceCaseStudySection caseStudies={content.caseStudies} />
      <MiceMediaSection items={content.mediaItems} />
      <MiceCapabilitySection points={content.capabilityPoints} stats={content.verifiedStats} />
      <RelatedLinks />
      <MiceFaqSection faqs={content.faqs} />
      <MiceFinalCta finalCta={content.finalCta} />
      <MiceConsultationForm />
    </SiteChrome>
  )
}
