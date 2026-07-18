import Link from 'next/link'
import { Phone, MessageCircle, Sparkles } from 'lucide-react'

export function MobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg sm:hidden">
      <div className="grid grid-cols-3 gap-px">
        <a
          href="tel:19001234"
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-foreground/80"
        >
          <Phone className="size-5 text-primary" />
          Gọi ngay
        </a>
        <a
          href="https://zalo.me"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-foreground/80"
        >
          <MessageCircle className="size-5 text-primary" />
          Zalo
        </a>
        <Link
          href="/contact"
          className="flex flex-col items-center gap-1 bg-primary py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <Sparkles className="size-5" />
          Tư vấn
        </Link>
      </div>
    </div>
  )
}
