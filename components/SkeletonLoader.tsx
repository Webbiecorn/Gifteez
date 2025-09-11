import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => {
  return (
    <div 
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${width} ${height} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    />
  );
};

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
      <Skeleton height="h-48" className="mb-4" />
      <div className="space-y-3">
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-5/6" />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Skeleton width="w-8" height="h-8" rounded />
            <div className="space-y-1">
              <Skeleton width="w-20" height="h-3" />
              <Skeleton width="w-16" height="h-3" />
            </div>
          </div>
          <Skeleton width="w-16" height="h-4" />
        </div>
      </div>
    </div>
  );
};

export const GiftCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
      <Skeleton height="h-40" className="mb-4" />
      <div className="space-y-3">
        <Skeleton height="h-5" width="w-3/4" />
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-2/3" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton width="w-20" height="h-6" />
          <Skeleton width="w-24" height="h-8" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Skeleton width="w-12" height="h-12" rounded />
      <div className="space-y-2">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-20" height="h-3" />
      </div>
    </div>
  );
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="h-4" 
          width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
};

export const ButtonSkeleton: React.FC = () => {
  return <Skeleton width="w-32" height="h-10" className="rounded-lg" />;
};

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton width="w-16" height="h-16" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Add the shimmer animation to the global CSS
const shimmerStyle = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Inject the style into the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = shimmerStyle;
  document.head.appendChild(styleElement);
}
