import type { PartnerLogo } from '@/types/homepage'

/**
 * Replaces the old infinite-scroll partner marquee, which was the one
 * animation on the homepage that ignored `prefers-reduced-motion` (see
 * Design Audit, Accessibility). A static grid communicates the same
 * proof with zero motion to manage and no duplicated DOM content for
 * screen readers to announce twice.
 */
export function LogoGrid({ partners }: { partners: PartnerLogo[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-10 gap-y-5" aria-label="Đối tác của Minh Việt Travel">
      {partners.map((partner) => (
        <li key={partner.id}>
          <span className="font-display text-lg text-foreground/45 transition-colors hover:text-foreground sm:text-xl">
            {partner.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
