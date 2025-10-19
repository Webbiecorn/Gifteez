import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Badge component for labels, status indicators, and tags
 * Uses design tokens from tailwind.config.ts for consistent styling
 */

const badgeVariants = cva(
  // Base styles - applied to all badges
  'inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 
          'bg-neutral-100 text-neutral-700 border border-neutral-200',
        primary: 
          'bg-primary-100 text-primary-700 border border-primary-200',
        secondary: 
          'bg-secondary-100 text-secondary-400 border border-secondary-200',
        accent: 
          'bg-accent-light text-accent-dark border border-accent',
        success: 
          'bg-success-bg text-success-dark border border-success-light',
        error: 
          'bg-error-bg text-error-dark border border-error-light',
        warning: 
          'bg-warning-bg text-warning-dark border border-warning-light',
        info: 
          'bg-info-bg text-info-dark border border-info-light',
        muted: 
          'bg-muted-rose text-neutral-700 border border-neutral-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      removable: {
        true: 'pr-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
  icon?: React.ReactNode;
}

/**
 * Badge component
 * 
 * @example
 * // Default badge
 * <Badge>Nieuw</Badge>
 * 
 * @example
 * // Success badge with icon
 * <Badge variant="success" icon={<Check size={14} />}>
 *   Beschikbaar
 * </Badge>
 * 
 * @example
 * // Removable badge
 * <Badge variant="primary" onRemove={() => console.log('removed')}>
 *   Filter: €20-€50
 * </Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, onRemove, icon, children, ...props }, ref) => {
    const removable = !!onRemove;

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, removable, className }))}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20"
            aria-label="Verwijder"
          >
            <svg
              className="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
