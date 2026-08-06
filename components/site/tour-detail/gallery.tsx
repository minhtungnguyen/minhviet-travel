import Image from 'next/image'
import type { TourGalleryImage as GalleryImage } from '@/lib/tours/public-tours'

/**
 * Degrades gracefully by design: a Tour's gallery is real Media Library
 * images picked by an editor (see `lib/tours/public-tours.ts`), so the
 * count varies per tour — padding the grid with an unrelated stock image
 * would violate Volume 01 §08 Photography ("ảnh phải phù hợp thương
 * hiệu", no generic filler). A single large editorial photo is the honest
 * baseline; a second real photo simply upgrades the layout.
 */
export function TourGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary sm:aspect-[21/9]">
        <Image
          src={images[0].src}
          alt={images[0].alt || title}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
    )
  }

  const [primary, ...rest] = images

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl bg-secondary sm:row-span-2">
        <Image
          src={primary.src}
          alt={primary.alt || title}
          fill
          sizes="(min-width: 1024px) 44vw, 100vw"
          className="object-cover"
        />
      </div>
      {rest.slice(0, 2).map((image) => (
        <div key={image.src} className="relative col-span-1 aspect-square overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={image.src}
            alt={image.alt || title}
            fill
            sizes="(min-width: 1024px) 22vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
