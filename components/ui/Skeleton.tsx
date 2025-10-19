import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Skeleton component for loading states
 * Uses design tokens for consistent styling
 */

const skeletonVariants = cva('animate-pulse bg-neutral-200 rounded', {
  variants: {
    variant: {
      text: 'h-4 bg-neutral-200',
      title: 'h-8 bg-neutral-300',
      avatar: 'rounded-full bg-neutral-200',
      thumbnail: 'aspect-square bg-neutral-200',
      rectangle: 'bg-neutral-200',
      circle: 'rounded-full bg-neutral-200',
    },
  },
  defaultVariants: {
    variant: 'rectangle',
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton component
 *
 * @example
 * // Text skeleton
 * <Skeleton variant="text" className="w-3/4" />
 *
 * @example
 * // Title skeleton
 * <Skeleton variant="title" className="w-1/2 mb-4" />
 *
 * @example
 * // Avatar skeleton
 * <Skeleton variant="avatar" className="w-12 h-12" />
 *
 * @example
 * // Card skeleton
 * <Card>
 *   <Skeleton variant="thumbnail" className="w-full h-48 mb-4" />
 *   <Skeleton variant="title" className="w-3/4 mb-2" />
 *   <Skeleton variant="text" className="w-full mb-2" />
 *   <Skeleton variant="text" className="w-5/6" />
 * </Card>
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        aria-label="Loading..."
        role="status"
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * ProductCardSkeleton - Pre-built skeleton for product cards
 */
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-4', className)}>
    <Skeleton variant="thumbnail" className="w-full h-48 mb-4" />
    <Skeleton variant="title" className="w-3/4 mb-3" />
    <Skeleton variant="text" className="w-full mb-2" />
    <Skeleton variant="text" className="w-5/6 mb-4" />
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="w-20 h-6" />
      <Skeleton variant="rectangle" className="w-24 h-10 rounded-lg" />
    </div>
  </div>
)

/**
 * BlogCardSkeleton - Pre-built skeleton for blog cards
 */
export const BlogCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
    <Skeleton variant="rectangle" className="w-full h-48" />
    <div className="p-6">
      <Skeleton variant="text" className="w-24 h-5 mb-3" />
      <Skeleton variant="title" className="w-full mb-3" />
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-4/5 mb-4" />
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-4 mb-1" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
    </div>
  </div>
)

/**
 * DealCardSkeleton - Pre-built skeleton for deal cards
 */
export const DealCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-4', className)}>
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="thumbnail" className="w-20 h-20 flex-shrink-0" />
      <div className="flex-1">
        <Skeleton variant="title" className="w-full mb-2" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
      <div>
        <Skeleton variant="text" className="w-16 h-4 mb-1" />
        <Skeleton variant="text" className="w-20 h-6" />
      </div>
      <Skeleton variant="rectangle" className="w-28 h-10 rounded-lg" />
    </div>
  </div>
)

/**
 * ListSkeleton - Multiple skeleton items
 */
export const ListSkeleton: React.FC<{
  count?: number
  itemClassName?: string
  containerClassName?: string
}> = ({ count = 3, itemClassName, containerClassName }) => (
  <div className={cn('space-y-4', containerClassName)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} variant="rectangle" className={cn('w-full h-20', itemClassName)} />
    ))}
  </div>
)

export { Skeleton, skeletonVariants }
