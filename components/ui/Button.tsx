import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button component with multiple variants and sizes
 * Uses design tokens from tailwind.config.ts for consistent styling
 */

const buttonVariants = cva(
  // Base styles - applied to all buttons
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-md hover:shadow-lg',
        secondary: 
          'bg-secondary-100 text-secondary-400 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-300 shadow-sm',
        accent: 
          'bg-accent text-white hover:bg-accent-hover active:scale-95 focus-visible:ring-accent shadow-glow hover:shadow-glow-lg',
        ghost: 
          'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400',
        link: 
          'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        success:
          'bg-success text-white hover:bg-success-dark active:bg-success-dark focus-visible:ring-success shadow-md',
        error:
          'bg-error text-white hover:bg-error-dark active:bg-error-dark focus-visible:ring-error shadow-md',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-6 text-lg',
        xl: 'h-15 px-8 text-xl',
        icon: 'h-11 w-11', // Square icon button
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-wait opacity-70',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button component
 * 
 * @example
 * // Primary button
 * <Button>Click me</Button>
 * 
 * @example
 * // Accent button with icon
 * <Button variant="accent" size="lg" leftIcon={<Heart />}>
 *   Toevoegen aan favorieten
 * </Button>
 * 
 * @example
 * // Loading state
 * <Button loading>Laden...</Button>
 * 
 * @example
 * // Full width
 * <Button fullWidth variant="secondary">
 *   Volledige breedte
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
