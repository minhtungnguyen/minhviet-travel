export const ROUTES = {
  home: '/',
  tours: '/tours',
  mice: '/mice',
  services: '/services',
  hotels: '/hotels',
  cruises: '/cruises',
  flights: '/flights',
  tickets: '/tickets',
  visa: '/visa',
  about: '/about',
  contact: '/contact',
  destinations: '/destinations',
} as const

export function tourHref(id: string) {
  return `/tour/${id}`
}

export function destinationHref(slug: string) {
  return `/destinations/${slug}`
}

export function contactHref(intent: 'corporate' | 'individual' | 'ai-advisor') {
  return `/contact?intent=${intent}`
}
