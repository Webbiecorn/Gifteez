import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { EmptyBoxIcon, SearchIcon, XCircleIcon } from '../IconComponents';

/**
 * EmptyState component for no-results, no-data, and error states
 * Uses design tokens for consistent styling
 */

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center px-6 py-12',
  {
    variants: {
      variant: {
        'no-results': 'bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200',
        'no-data': 'bg-neutral-50 rounded-lg border border-neutral-200',
        'error': 'bg-error-bg rounded-lg border border-error-light',
      },
      size: {
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
      },
    },
    defaultVariants: {
      variant: 'no-results',
      size: 'md',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  suggestions?: React.ReactNode;
}

/**
 * EmptyState component
 * 
 * @example
 * // No search results
 * <EmptyState
 *   variant="no-results"
 *   title="Geen resultaten gevonden"
 *   description="Probeer je zoekopdracht aan te passen"
 *   action={<Button>Filters wissen</Button>}
 * />
 * 
 * @example
 * // Error state
 * <EmptyState
 *   variant="error"
 *   title="Er is iets misgegaan"
 *   description="We konden de gegevens niet laden"
 *   action={<Button>Opnieuw proberen</Button>}
 * />
 * 
 * @example
 * // No data with suggestions
 * <EmptyState
 *   variant="no-data"
 *   title="Geen favorieten"
 *   description="Je hebt nog geen producten opgeslagen"
 *   suggestions={<div>Bekijk onze aanbevelingen</div>}
 * />
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      title,
      description,
      action,
      suggestions,
      ...props
    },
    ref
  ) => {
    // Default icons based on variant
    const getDefaultIcon = () => {
      if (icon) return icon;
      
      switch (variant) {
        case 'error':
          return <XCircleIcon className="w-16 h-16 text-error" />;
        case 'no-results':
          return <SearchIcon className="w-16 h-16 text-neutral-400" />;
        case 'no-data':
        default:
          return <EmptyBoxIcon className="w-16 h-16 text-neutral-400" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, className }))}
        role="status"
        aria-live="polite"
        {...props}
      >
        {/* Icon */}
        <div className="mb-4 flex-shrink-0">
          {getDefaultIcon()}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-base text-neutral-600 mb-6 max-w-md">
            {description}
          </p>
        )}

        {/* Action button */}
        {action && (
          <div className="mb-6">
            {action}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className="w-full max-w-2xl">
            {suggestions}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState, emptyStateVariants };
