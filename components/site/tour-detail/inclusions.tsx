import { Check, X } from 'lucide-react'

export function TourInclusions({ inclusions, exclusions }: { inclusions: string[]; exclusions: string[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="font-display text-base font-bold text-foreground">Giá tour bao gồm</h3>
        <ul className="mt-4 space-y-3">
          {inclusions.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-foreground">Giá tour không bao gồm</h3>
        <ul className="mt-4 space-y-3">
          {exclusions.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
              <X className="mt-0.5 size-4 shrink-0 text-destructive" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
