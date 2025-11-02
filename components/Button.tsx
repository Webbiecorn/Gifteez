import React from 'react'
import clsx from 'clsx'

type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'affiliate'
  | 'affiliateSecondary'
  | 'danger'
  | 'error'
  | 'outline'
  | 'inline'

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'large'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  className?: string
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-display font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-3.5 px-7 text-lg',
  xl: 'py-4 px-8 text-xl',
  large: 'py-4 px-8 text-xl',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/95 hover:to-accent-hover focus:ring-accent',
  accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
  secondary:
    'bg-white text-purple-700 border border-accent/40 hover:border-accent focus:ring-accent/40',
  ghost: 'bg-transparent text-white border border-white/40 hover:bg-white/10 focus:ring-white/40',
  affiliate:
    'bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 text-white shadow-[0_16px_45px_-20px_rgba(225,29,72,0.8)] hover:from-rose-500 hover:via-rose-400 hover:to-amber-300 hover:shadow-[0_22px_55px_-20px_rgba(225,29,72,0.85)] focus:ring-rose-200',
  affiliateSecondary:
    'bg-white/90 text-primary border border-rose-100 hover:bg-rose-50 focus:ring-rose-200 shadow-[0_12px_35px_-25px_rgba(225,29,72,0.6)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 shadow-lg',
  error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 shadow-lg',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary/10 focus:ring-primary focus:ring-offset-1',
  inline:
    'bg-transparent text-primary underline underline-offset-4 shadow-none hover:shadow-none px-0 py-0 hover:scale-100 focus:ring-0 focus:ring-offset-0 transform-none',
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const computedClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && 'w-full',
    loading && 'opacity-75 cursor-wait',
    className
  )

  return (
    <button className={computedClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex items-center gap-2">{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}

export default Button
