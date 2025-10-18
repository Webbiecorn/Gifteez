import React from 'react';

/**
 * Skeleton loader for deal cards
 * Shows animated placeholder while deals are loading
 */
const DealCardSkeleton: React.FC = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      
      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
        </div>
        
        {/* Price and badges skeleton */}
        <div className="mt-auto space-y-2.5">
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          
          {/* Score skeleton */}
          <div className="h-5 w-32 rounded bg-slate-100 animate-pulse" />
          
          {/* Button skeleton */}
          <div className="h-10 w-full rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for featured "Deal of the Week" section
 */
export const FeaturedDealSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="grid lg:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Image skeleton */}
        <div className="flex items-center justify-center bg-slate-50 rounded-2xl p-6 h-80 animate-pulse">
          <div className="w-64 h-64 rounded-lg bg-slate-200" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex flex-col justify-center gap-4">
          {/* Badge skeleton */}
          <div className="h-7 w-32 rounded-full bg-slate-200 animate-pulse" />
          
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-slate-200 animate-pulse" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
          </div>
          
          {/* Price badges skeleton */}
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-10 w-24 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-10 w-32 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-3 mt-2">
            <div className="h-12 w-48 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-12 w-40 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for carousel section
 */
export const CarouselSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      </div>
      
      {/* Cards skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px]">
            <DealCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealCardSkeleton;
