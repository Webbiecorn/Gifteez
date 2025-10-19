import React from 'react'

/**
 * Skeleton loader for blog post cards on HomePage
 */
export const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-3 p-6">
        {/* Category badge skeleton */}
        <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 mt-2">
          <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loader for collection cards on HomePage
 */
export const CollectionCardSkeleton: React.FC = () => {
  return (
    <div className="group relative overflow-hidden rounded-3xl shadow-lg">
      {/* Image skeleton with shimmer */}
      <div className="relative h-80 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>

      {/* Overlay skeleton */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          {/* Title skeleton */}
          <div className="h-7 w-3/4 rounded bg-white/30 animate-pulse backdrop-blur-sm" />
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-white/20 animate-pulse backdrop-blur-sm" />
            <div className="h-4 w-2/3 rounded bg-white/20 animate-pulse backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loader for "How it works" steps
 */
export const StepCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Icon skeleton */}
      <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse mb-4" />

      {/* Title skeleton */}
      <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-3" />

      {/* Description skeleton */}
      <div className="space-y-2 w-full">
        <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse mx-auto" />
      </div>
    </div>
  )
}

export default BlogPostSkeleton
