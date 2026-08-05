export type TourCategory = {
  id: string
  websiteId: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
