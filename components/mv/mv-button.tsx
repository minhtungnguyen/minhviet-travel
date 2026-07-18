import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const mvButtonVariants = cva(
  'group inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-deep',
        gold: 'bg-gold text-deep hover:bg-gold-soft',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        outline:
          'border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background',
        'outline-gold':
          'border border-gold/60 bg-transparent text-gold hover:bg-gold/10 hover:border-gold',
        'outline-light':
          'border border-white/40 bg-transparent text-white hover:bg-white hover:text-deep',
        ghost: 'text-foreground hover:bg-secondary/70',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        /** min 44px touch target on touch/tablet; compact 36px only from `sm:` breakpoint up, where pointer precision is assumed. */
        sm: 'h-11 px-4 text-sm [&_svg]:size-4 sm:h-9',
        md: 'h-11 px-6 text-sm [&_svg]:size-4',
        lg: 'h-13 px-8 text-base [&_svg]:size-5',
        icon: 'size-11 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type MVButtonProps = {
  className?: string
  loading?: boolean
  href?: string
  children: React.ReactNode
} & VariantProps<typeof mvButtonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export function MVButton({
  className,
  variant,
  size,
  loading,
  href,
  children,
  disabled,
  ...props
}: MVButtonProps) {
  const classes = cn(mvButtonVariants({ variant, size }), className)

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export { mvButtonVariants }
