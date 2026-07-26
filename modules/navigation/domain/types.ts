export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type NavigationMenuKey = 'HEADER' | 'FOOTER' | 'MOBILE' | 'SERVICE' | 'LEGAL' | 'SOCIAL' | 'ANNOUNCEMENT_BAR'

export type NavigationMenu = {
  id: string
  websiteId: string
  key: NavigationMenuKey
  locale: string
  status: EntityStatus
}

export type NavigationItem = {
  id: string
  menuId: string
  parentItemId: string | null
  label: string
  url: string | null
  cmsPageId: string | null
  isExternal: boolean
  openInNewTab: boolean
  position: number
  status: EntityStatus
}
