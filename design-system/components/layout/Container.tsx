import { cn } from '@/lib/utils'

const sizeClass = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1440px]',
} as const

export type ContainerProps = {
  size?: keyof typeof sizeClass
  className?: string
  children: React.ReactNode
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main'
}

/** Centered content well with the system's responsive gutters. */
export function Container({ size = 'xl', className, children, as = 'div' }: ContainerProps) {
  const Tag = as as React.ElementType
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-6 lg:px-10', sizeClass[size], className)}>
      {children}
    </Tag>
  )
}
