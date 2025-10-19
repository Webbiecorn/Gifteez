import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1", "3/4"
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean; // For LCP images
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onError?: () => void;
}

/**
 * Responsive image component with automatic aspect-ratio to prevent CLS
 * 
 * Features:
 * - Prevents Cumulative Layout Shift (CLS) with aspect-ratio container
 * - Lazy loading by default (except priority images)
 * - Modern image formats support (WebP/AVIF) via picture element
 * - Automatic fetchpriority for LCP images
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
  loading,
  priority = false,
  objectFit = 'cover',
  onError
}) => {
  // Determine loading strategy
  const loadingStrategy = loading || (priority ? 'eager' : 'lazy');
  
  // Extract file extension and create WebP/AVIF paths
  const ext = src.split('.').pop()?.toLowerCase();
  const basePath = src.replace(/\.[^/.]+$/, '');
  const webpSrc = ext && ['jpg', 'jpeg', 'png'].includes(ext) ? `${basePath}.webp` : null;
  const avifSrc = ext && ['jpg', 'jpeg', 'png'].includes(ext) ? `${basePath}.avif` : null;

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <picture className="absolute inset-0">
        {/* AVIF - best compression */}
        {avifSrc && (
          <source srcSet={avifSrc} type="image/avif" />
        )}
        
        {/* WebP - good compression, wide support */}
        {webpSrc && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        
        {/* Original format - fallback */}
        <img
          src={src}
          alt={alt}
          loading={loadingStrategy}
          fetchPriority={priority ? 'high' : undefined}
          className={`absolute inset-0 w-full h-full object-${objectFit}`}
          onError={onError}
          decoding="async"
        />
      </picture>
    </div>
  );
};

export default ResponsiveImage;
