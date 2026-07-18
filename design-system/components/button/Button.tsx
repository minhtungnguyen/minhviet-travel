import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Design System Button.
 *
 * Six variants, two explicit states (loading, disabled). `primary` is the
 * only fill that uses Enterprise Blue — that is the system's rule, not an
 * accident: blue exists to mark the one interactive action on a screen.
 * `premium` (Champagne Bronze) is for rare, deliberately elevated moments —
 * it should not appear more than once per screen.
 *
 * This component is part of the standalone /design-system foundation and is
 * not wired into any existing page yet.
 */

const buttonVariants = cva(
  'ds-transition inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-ds-body font-semibold outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ds-blue-600/40 focus-visible:ring-offset-2 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-ds-interactive-default text-ds-text-inverse hover:bg-ds-interactive-hover active:bg-ds-interactive-active',
        secondary:
          'border border-ds-border-default bg-ds-surface-base text-ds-text-primary hover:border-ds-border-strong hover:bg-ds-surface-muted',
        ghost: 'bg-transparent text-ds-text-primary hover:bg-ds-surface-muted',
        text: 'bg-transparent px-0 text-ds-interactive-default hover:text-ds-interactive-hover hover:underline underline-offset-4',
        danger:
          'bg-ds-danger-default text-ds-text-inverse hover:bg-ds-danger-strong',
        premium:
          'bg-ds-accent-default text-ds-text-on-bronze hover:bg-ds-accent-hover',
      },
      size: {
        sm: 'h-9 rounded-ds-md px-3.5 text-[13px] [&_svg]:size-4',
        md: 'h-11 rounded-ds-md px-5 text-sm [&_svg]:size-4',
        lg: 'h-13 rounded-ds-lg px-6 text-[15px] [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonOwnProps = {
  className?: string
  loading?: boolean
  href?: string
  children: React.ReactNode
} & VariantProps<typeof buttonVariants>

export type ButtonProps = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>

export function Button({
  className,
  variant,
  size,
  loading,
  href,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonVariants({ variant, size }),
    variant === 'text' && 'h-auto',
    className,
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export { buttonVariants }
