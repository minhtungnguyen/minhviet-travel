export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type FaqCategory = {
  id: string
  websiteId: string
  name: string
  slug: string
  position: number
  status: EntityStatus
}

export type Faq = {
  id: string
  faqCategoryId: string
  websiteId: string
  locale: string
  question: string
  answer: string
  position: number
  status: EntityStatus
}
