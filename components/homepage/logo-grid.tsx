import Image from 'next/image'
import type { PartnerLogo } from '@/types/homepage'

/**
 * Replaces the old infinite-scroll partner marquee, which was the one
 * animation on the homepage that ignored `prefers-reduced-motion` (see
 * Design Audit, Accessibility). A static grid communicates the same
 * proof with zero motion to manage and no duplicated DOM content for
 * screen readers to announce twice.
 *
 * Renders the real logo image once a partner has one uploaded via the
 * CMS Partner logos editor (`wordmarkImage`); falls back to the plain
 * text wordmark for any partner that doesn't yet — an honest partial
 * state, not a placeholder image.
 */
export function LogoGrid({ partners }: { partners: PartnerLogo[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-10 gap-y-5" aria-label="Đối tác của Minh Việt Travel">
      {partners.map((partner) =>
        partner.wordmarkImage ? (
          <li key={partner.id} className="opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            <Image
              src={partner.wordmarkImage.src}
              alt={partner.wordmarkImage.alt}
              width={partner.wordmarkImage.width}
              height={partner.wordmarkImage.height}
              className="h-8 w-auto object-contain sm:h-9"
              unoptimized={partner.wordmarkImage.src.startsWith('http')}
            />
          </li>
        ) : (
          <li key={partner.id}>
            <span className="font-display text-lg text-foreground/45 transition-colors hover:text-foreground sm:text-xl">
              {partner.name}
            </span>
          </li>
        ),
      )}
    </ul>
  )
}
