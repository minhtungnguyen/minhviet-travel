import { z } from 'zod'

/**
 * Runtime validation for content coming out of the CMS adapter. This is
 * the boundary Volume 02 Ch.18.2 requires ("validate external and form
 * data") — content is treated as untrusted input, not as a trusted
 * internal constant, even while the adapter still reads from a local
 * seed file.
 */

const cmsImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
})

const cmsLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

const verifiedStatSchema = z.object({
  id: z.string().min(1),
  value: z.number(),
  suffix: z.string().optional(),
  label: z.string().min(1),
  source: z.string().min(1),
  asOf: z.string().min(1),
})

const audienceSegmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.enum(['building', 'landmark', 'users', 'briefcase']),
})

const partnerLogoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  wordmarkImage: cmsImageSchema.optional(),
  category: z.enum(['airline', 'hotel', 'other']),
})

const serviceTileSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.enum(['group', 'briefcase', 'sparkles', 'building', 'ship', 'plane', 'ticket']),
  href: z.string().min(1),
})

const serviceGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  services: z.array(serviceTileSchema).min(1),
})

const aiAdvisorQuestionSchema = z.object({
  id: z.enum(['budget', 'groupSize', 'preference']),
  label: z.string().min(1),
  placeholder: z.string().min(1),
  options: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(1),
})

const availabilitySchema = z.enum([
  'open',
  'limited',
  'almost-full',
  'closed',
  'pending-confirmation',
])

const journeyContentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  country: z.string().min(1),
  category: z.enum(['asia', 'europe', 'domestic']),
  duration: z.string().min(1),
  departure: z.string().min(1),
  nextDeparture: z.string().min(1),
  priceFrom: z.number().nonnegative(),
  priceType: z.enum(['estimate', 'confirmed']),
  currency: z.literal('VND'),
  availability: availabilitySchema,
  reviewScore: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().optional(),
  image: cmsImageSchema,
  href: z.string().min(1),
  matchTags: z.array(z.string()),
})

const destinationContentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  journeyCount: z.number().nonnegative(),
  image: cmsImageSchema,
  href: z.string().min(1),
})

const brandStoryContentSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  image: cmsImageSchema,
  href: z.string().min(1),
  size: z.enum(['large', 'small']),
})

export const homepageContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    headlineAccent: z.string().min(1),
    subhead: z.string().min(1),
    primaryCta: cmsLinkSchema,
    secondaryCta: cmsLinkSchema,
    backgroundImage: cmsImageSchema,
    proofStat: verifiedStatSchema,
  }),
  trustStrip: z.object({
    eyebrow: z.string().min(1),
    positioning: z.object({
      headline: z.string().min(1),
      description: z.string().min(1),
    }),
    segments: z.array(audienceSegmentSchema).min(1),
    stats: z.array(verifiedStatSchema).min(1),
    partners: z.array(partnerLogoSchema).min(1),
  }),
  coreServices: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    groups: z.array(serviceGroupSchema).min(1),
  }),
  enterpriseMice: z.object({
    badge: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    story: z.string().min(1),
    process: z.array(z.string().min(1)).min(1),
    proofStat: verifiedStatSchema,
    image: cmsImageSchema,
    cta: cmsLinkSchema,
  }),
  aiAdvisor: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    titleAccent: z.string().min(1),
    description: z.string().min(1),
    disclosureNote: z.string().min(1),
    questions: z.array(aiAdvisorQuestionSchema).min(1),
    humanHandoffCta: cmsLinkSchema,
  }),
  featuredJourneys: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    titleAccent: z.string().min(1),
    filters: z
      .array(z.object({ id: z.enum(['all', 'asia', 'europe', 'domestic']), label: z.string() }))
      .min(1),
    journeys: z.array(journeyContentSchema).min(1),
    viewAllCta: cmsLinkSchema,
  }),
  destinations: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    titleAccent: z.string().min(1),
    destinations: z.array(destinationContentSchema).min(1),
  }),
  brandCenter: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    stories: z.array(brandStoryContentSchema).min(1),
    cta: cmsLinkSchema,
  }),
  finalCta: z.object({
    corporate: z.object({
      label: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      cta: cmsLinkSchema,
    }),
    individual: z.object({
      label: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      cta: cmsLinkSchema,
    }),
    phone: z.string().min(1),
    zaloHref: z.string().min(1),
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonicalPath: z.string().min(1),
    organizationName: z.string().min(1),
    organizationLogo: z.string().min(1),
    contactPhone: z.string().min(1),
    contactEmail: z.string().min(1),
    addressLocality: z.string().min(1),
    addressCountry: z.string().min(1),
  }),
})

export const aiAdvisorInputSchema = z.object({
  budget: z.string().min(1, 'Vui lòng chọn ngân sách dự kiến'),
  groupSize: z.string().min(1, 'Vui lòng chọn quy mô đoàn'),
  preference: z.string().min(1, 'Vui lòng chọn ưu tiên điểm đến'),
})

export const leadFormSchema = z.object({
  intent: z.enum(['corporate', 'individual']),
  fullName: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
  organization: z.string().optional(),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  serviceInterest: z.string().min(1, 'Vui lòng chọn nhu cầu quan tâm'),
  message: z.string().optional(),
  aiContext: z.string().optional(),
})

export const newsletterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

export type LeadFormInput = z.infer<typeof leadFormSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
