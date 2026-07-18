import { cn } from '@/lib/utils'

const colsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  12: 'grid-cols-12',
}

const gapClass = {
  none: 'gap-0',
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-6',
  xl: 'gap-8',
} as const

export type GridProps = {
  /** Column count at the `lg` breakpoint; grids default to 1 column below `sm`. */
  cols?: 2 | 3 | 4 | 5 | 6 | 12
  gap?: keyof typeof gapClass
  className?: string
  children: React.ReactNode
}

/** Responsive CSS grid: 1 column on mobile, expanding to `cols` at desktop widths. */
export function Grid({ cols = 3, gap = 'md', className, children }: GridProps) {
  return (
    <div className={cn('grid grid-cols-1', colsClass[cols], gapClass[gap], className)}>
      {children}
    </div>
  )
}
